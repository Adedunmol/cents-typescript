import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors';
import { DecodedToken, DecodedData } from '../utils/interfaces';


export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || req.headers.Authorization as string

    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedError('You do not have the access token')

    const accessToken = authHeader.split(' ')[1]

    jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
        {},
        (err: any, data) => {
            if (err) throw new UnauthorizedError('You are sending a bad token')
            let decodedData = data as DecodedData

            const dataObj = {
                id: decodedData.UserInfo.id,
                email: decodedData.UserInfo.email,
                roles: decodedData.UserInfo.roles
            }

            req.user = dataObj
            next()
        }
    )
}