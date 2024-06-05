import { DocumentDefinition } from 'mongoose';
import { pick } from 'lodash';
import { ConflictError, NotFoundError, UnauthorizedError } from '../errors';
import User, { UserDocument } from '../models/user.model';
import UserOTPVerification from '../models/user-otp-verification.model';
import { InternalServerError } from '../errors/internal-server-error';
import bcrypt from 'bcrypt';

export const createUser = async (input: DocumentDefinition<Omit<UserDocument, 'comparePassword' |'refreshToken' | 'createdAt' | 'updatedAt' | 'verified'>>) => {
    try {
        const user = await User.create(input)

        return pick(user.toJSON(), ['_id', 'email', 'fullName', 'username'])
    }catch (e: any) {
        throw new ConflictError('User already exists')
    }
}

export const findUserByEmail = async (email: string) => {
    try {
        return await User.findOne({ email })
    }catch (err: any) {
        throw new NotFoundError(err)
    }
}

export const findUserWithToken = async (refreshToken: string) => {
    try {
        return await User.findOne({ refreshToken })
    }catch (err: any) {
        throw new NotFoundError(err)
    }
}

export const validatePassword = async ({ password, email }: { email: string, password: string }) => {
    try {
        const user = await findUserByEmail(email)

        if (!user) return false
    
        const match = await user.comparePassword(password)

        if (!match) return false
        
        return user
    } catch (err: any) {
        throw new UnauthorizedError(err)
    }
}

export const findUserWithOtp = async (userId: string) => {
    try {
        return await UserOTPVerification.find({ userId })
    } catch (err: any) {
        throw new NotFoundError(err)
    }
}

export const deleteUserOtp = async (userId: string) => {
    try {
        return await UserOTPVerification.deleteMany({ userId })
    } catch (err: any) {
        throw new Error(err)
    }
}

export const updateUserVerification = async (userId: string) => {
    try {
        return await User.findOneAndUpdate({ _id: userId }, { verified: true }, { new: true })
    } catch (err: any) {
        throw new NotFoundError(err)
    }
}

export const generateOtp = async (userId: string, email: string) => {
    try {
        const OTP_EXPIRATION = 3600000

        const otp = `${Math.floor(1000 + Math.random() * 9000)}`

        const hashedOTP = await bcrypt.hash(otp, 10)

        const userOTPVerification = await UserOTPVerification.create({
            userId,
            otp: hashedOTP,
            expiresAt: Date.now() + OTP_EXPIRATION
        })

        return otp
    } catch (err: any) {
        throw new InternalServerError(err)
    }
}