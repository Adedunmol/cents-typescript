import { DocumentDefinition } from 'mongoose';
import User, { UserDocument } from '../models/user.model';

export const createUser = async (input: DocumentDefinition<Omit<UserDocument, 'comparePassword' |'refreshToken' | 'createdAt' | 'updatedAt'>>) => {
    try {
        return await User.create(input)
    }catch (err: any) {
        throw new Error(err)
    }
}

export const findUser = async (email: string) => {
    try {
        return await User.findOne({ email })
    }catch (err: any) {
        throw new Error(err)
    }
}

export const findUserWithToken = async (refreshToken: string) => {
    try {
        return await User.findOne({ refreshToken })
    }catch (err: any) {
        throw new Error(err)
    }
}