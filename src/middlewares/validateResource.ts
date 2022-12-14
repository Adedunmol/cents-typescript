import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import { StatusCodes } from "http-status-codes";

const validateResource = (schema: AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body
            })
            next()
        }catch (err: any) {
            return res.status(StatusCodes.BAD_REQUEST).send(err.issues)
        }
    
    }
}

export default validateResource;