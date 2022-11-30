import { DocumentDefinition } from 'mongoose'
import { ConflictError } from '../errors'
import { User, UserDocument } from '../models/user.model'

export const createUser = async (input: DocumentDefinition<Omit<UserDocument, 'comparePassword' |'refreshToken' | 'createdAt' | 'updatedAt'>>) => {
    try {
        return await User.create(input)
    }catch (err: any) {
        throw new Error(err)
    }
}
