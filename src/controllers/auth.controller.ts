import { Request, Response } from "express";
import { createUserInput } from "../schema/auth.schema";
import { createUser } from "../service/auth.service";
import admin_list from "../config/admin_list";


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

        return user
    }catch (err: any) {
        return res.send(err)
    }
}

export const loginController = async (req: Request<{}, {}, {}>, res: Response) => {

}

export const logoutController = async (req: Request<{}, {}, {}>, res: Response) => {

}

export const refreshTokenController = async (req: Request<{}, {}, {}>, res: Response) => {

}