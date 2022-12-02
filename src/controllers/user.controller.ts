import { Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { findUserAndUpdate } from "../service/user.service";
import { updateUserInput } from '../schema/user.schema'

export const updateUserController = async (req: Request<{}, {}, updateUserInput['body']>, res: Response) => {
    const userId = req.user.id

    const user = await findUserAndUpdate({ _id: userId }, req.body)

    return res.status(StatusCodes.OK).json({ user })
}