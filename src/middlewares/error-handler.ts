import { Errback, NextFunction, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';

export const errorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    
    const customError = {
        message: err.message || 'Something went wrong, try again later',
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    }

    //Duplicate fields
    if (err.code && err.code === 11000) {
        customError.message = `Duplicate value entered for ${Object.values(err.keyValue)} field`
        customError.statusCode = StatusCodes.BAD_REQUEST
    }
    

    return res.status(customError.statusCode).json({ message: customError.message })
}