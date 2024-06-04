import { DocumentDefinition } from 'mongoose';
import { pick } from 'lodash';
import { ConflictError, NotFoundError, UnauthorizedError } from '../errors';
import User, { UserDocument } from '../models/user.model';
import UserOTPVerification from '../models/user-otp-verification.model';

export const createUser = async (input: DocumentDefinition<Omit<UserDocument, 'comparePassword' |'refreshToken' | 'createdAt' | 'updatedAt' | 'verified'>>) => {
    try {
        const user = await User.create(input)

        return pick(user.toJSON(), ['_id', 'email', 'fullName'])
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