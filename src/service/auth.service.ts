import { DocumentDefinition } from 'mongoose';
import { omit, pick } from 'lodash';
import { ConflictError } from '../errors';
import User, { UserDocument } from '../models/user.model';

export const createUser = async (input: DocumentDefinition<Omit<UserDocument, 'comparePassword' |'refreshToken' | 'createdAt' | 'updatedAt'>>) => {
  
    const user = await User.create(input)

    return pick(user.toJSON(), ['_id', 'email', 'fullName'])
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