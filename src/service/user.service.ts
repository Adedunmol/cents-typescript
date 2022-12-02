import { FilterQuery, UpdateQuery } from "mongoose";
import { User, UserDocument } from "../models/user.model";


export const findUserAndUpdate = async (query: FilterQuery<UserDocument>, update: UpdateQuery<UserDocument>) => {
    const result = await User.findOneAndUpdate(query, update, { new: true, runValidators: true }).select('-roles -password')

    return result
}