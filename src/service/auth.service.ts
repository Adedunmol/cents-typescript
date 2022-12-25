import { DocumentDefinition } from 'mongoose';
import { pick } from 'lodash';
import { ConflictError } from '../errors';
import User, { UserDocument } from '../models/user.model';

export const createUser = async (input: DocumentDefinition<Omit<UserDocument, 'comparePassword' |'refreshToken' | 'createdAt' | 'updatedAt'>>) => {
    try {
        const user = await User.create(input)

        return pick(user.toJSON(), ['_id', 'email', 'fullName'])
    }catch (e: any) {
        throw new ConflictError('User already exists')
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

export const validatePassword = async ({ password, email }: { email: string, password: string }) => {
    try {
        const user = await findUser(email)

        if (!user) return false
    
        const match = await user.comparePassword(password)

        if (!match) return false
        
        return user
    } catch (err: any) {
        throw new Error(err)
    }
}