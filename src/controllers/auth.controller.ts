import { Request, Response } from "express";
import { createUserInput, loginUserInput } from "../schema/auth.schema";
import { createUser, findUser, findUserWithToken, validatePassword } from "../service/auth.service";
import admin_list from "../config/admin_list";
import { NotFoundError, UnauthorizedError, ForbiddenError, ConflictError } from "../errors";
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { DecodedToken } from '../utils/interfaces'

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
