import { Request, Response } from "express";
import { createUserInput, loginUserInput } from "../schema/auth.schema";
import { createUser, findUser, findUserWithToken, validatePassword } from "../service/auth.service";
import admin_list from "../config/admin_list";
import { NotFoundError, UnauthorizedError, ForbiddenError, ConflictError } from "../errors";
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { DecodedToken } from '../utils/interfaces';
import bcrypt from 'bcrypt';
import UserOTPVerification from "../models/user-otp-verification.model";
import User from "../models/user.model";
import { sendToQueue } from "../queue";

export const registerController = async (req: Request<{}, {}, createUserInput['body']>, res: Response) => {
    try {
    if (admin_list.has(req.body.email)) {
        req.body.roles = {
            Admin: 3001,
            User: 1984,
            Moderator: 2150
        }
    }
    
    const user = await createUser(req.body)

    // sendToQueue('emails', ) // send verification mail to user

    return res.status(StatusCodes.CREATED).json({ user })
    } catch (err: any) {
        return res.status(409).send('user exists')
    }
}

export const loginController = async (req: Request<{}, {}, loginUserInput['body']>, res: Response) => {
    const { email, password } = req.body;
    const cookie = req.cookies;

    const user = await validatePassword({ email, password })

    if (user) {

        const roles = Object.values(user.roles)

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    email: user.email,
                    id: user._id,
                    roles: roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign(
            {
                email: user.email
            },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '1d' }
        )

        let newRefreshTokenArray = !cookie?.jwt ? user.refreshToken : user.refreshToken.filter(token => token !== cookie?.jwt)
            
        if (cookie?.jwt) {
            res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60, sameSite: 'none' })
            
            const foundUser = await findUserWithToken(cookie.jwt)

            if (foundUser) {
                newRefreshTokenArray = []
            }
        }

        user.refreshToken = [...newRefreshTokenArray, refreshToken]
        const result = await user.save()

        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 15 * 60 * 1000, sameSite: 'none' })
        return res.status(StatusCodes.OK).json({ accessToken, expiresIn: 15 * 60 * 1000 })
    }

    throw new UnauthorizedError('Invalid credentials')
}

export const logoutController = async (req: Request, res: Response) => {
    const cookie = req.cookies;

    if (!cookie) return res.sendStatus(StatusCodes.NO_CONTENT)

    const refreshToken = cookie.jwt
    const foundUser = await findUserWithToken(refreshToken)

    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60, sameSite: 'none' })
        return res.sendStatus(StatusCodes.NO_CONTENT)
    }

    foundUser.refreshToken = foundUser.refreshToken.filter(token => token !== refreshToken)
    res.clearCookie('jwt', {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none'})

    const result = await foundUser.save()

    return res.sendStatus(StatusCodes.NO_CONTENT)
}


export const refreshTokenController = async (req: Request, res: Response) => {
    const cookie = req.cookies
    

    if (!cookie?.jwt) {
        throw new UnauthorizedError('You are not authorized to access this route')
    }

    const refreshToken = cookie.jwt
    res.clearCookie('jwt', {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none'})

    const user = await findUserWithToken(refreshToken)

      //reuse detected
    if (!user) {
        
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string,
            {},
            async (err: any, data) => {
                if (err) {
                    throw new ForbiddenError('bad token for reuse')
                }
                let decodedData = data as DecodedToken
                const user = await findUser(decodedData?.email)
                
                if (user) {
                    user.refreshToken = []
                }
            }
        )

        throw new UnauthorizedError('Token reuse')
    }

    let newRefreshTokenArray = user.refreshToken.filter(token => token !== refreshToken)

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        {},
        async (err: any, data) => {
            if (err) {
                user.refreshToken = [...newRefreshTokenArray]
                const result = await user.save()
            }
            let decodedData = data as DecodedToken
            if (err || decodedData.email !== user.email) {
                throw new ForbiddenError('Bad Token')
            }

            const roles = Object.values(user.roles)

            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        id: user._id,
                        email: user.email,
                        roles: roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET as string,
                { expiresIn: '1d' }
            )

            const newRefreshToken = jwt.sign(
                {
                    email: user.email
                },
                process.env.REFRESH_TOKEN_SECRET as string,
                { expiresIn: '1d' }
            )
            
            
            user.refreshToken = [...newRefreshTokenArray, newRefreshToken]
            const result = await user.save()

            res.cookie('jwt', newRefreshToken, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none'})

            return res.status(StatusCodes.OK).json({ accessToken, expiresIn: 15 * 60 * 1000 })
        }
    )
}

export const verifyOtpController = async (req: Request, res: Response) => {
    const userOTPRecords = await UserOTPVerification.find({ userId: req.body.userId.trim() })

    if (userOTPRecords.length <= 0) {
        throw new Error("Account record doesn't exist or has been verified already. Please sign up or log in.")
    }

    // user otp record exists
    const { expiresAt } = userOTPRecords[0]
    const hashedOTP = userOTPRecords[0].otp

    if (expiresAt < Date.now()) {

        await UserOTPVerification.deleteMany({ userId: req.body.userId.trim() })
        throw new Error("Code has expired. Please request again.")
    }

    const validOTP = await bcrypt.compare(req.body.otp, hashedOTP)

    if (!validOTP) {
        throw new Error("Invalid code passed. Check your inbox.")
    }

    const user = await User.findOneAndUpdate({ _id: req.body.userId.trim() }, { verified: true }, { new: true })

    await UserOTPVerification.deleteMany({ userId: req.body.userId.trim() })  
    
    return res.status(200).json({ status: "verified", message: "User email verified successfully", data: { id: user?.id } })
}

export const resendOtpController = async (req: Request, res: Response) => {
    await UserOTPVerification.deleteMany({ userId: req.body.userId.trim() })
    // await sendOTPVerificationEmail({ _id: req.body.userId.trim(), email: req.body.email.trim() }, res)

    return res.status(200).json({ status: "pending", message: "Verification OTP email sent", data: { userId: req.body.userId, email: req.body.email } })
}

export const resetPasswordRequestController = async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email.trim() })

    if (!user) throw new Error("No user found with this email")

    if (!user.verified) throw new Error("Email hasn't been verified yet. Check your inbox.")

    const otpDetails = {
        email: req.body.email.trim(),
        _id: user.id
    }

    await UserOTPVerification.deleteMany({ userId: user.id })
    // const userOTPVerification = await sendPasswordResetEmail(otpDetails, res)

    return res.status(200).json({ status: "success", data: { userId: user.id, email: user.email, otp: '1234' } }) // userOTPVerification.otp

}

export const resetPasswordController = async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email.trim() })

    if (!user) throw new Error("No user found with this email")

    const userOTPRecords = await UserOTPVerification.find({ userId: user.id })

    if (userOTPRecords.length <= 0) {
        throw new Error("Password reset request has not been made.")
    }

    // user otp record exists
    const { expiresAt } = userOTPRecords[0]
    const hashedOTP = userOTPRecords[0].otp

    if (expiresAt < Date.now()) {

        await UserOTPVerification.deleteMany({ email: req.body.email.trim() })
        throw new Error("Code has expired. Please request again.")
    }

    const validOTP = await bcrypt.compare(req.body.otp.trim(), hashedOTP)

    if (!validOTP) {
        throw new Error("Invalid code passed. Check your inbox.")
    }

    user.password = req.body.password.trim()
    const result = await user.save()

    await UserOTPVerification.deleteMany({ userId: user.id })

    return res.status(200).json({ status: "success", message: "Password changed successfully" })
}