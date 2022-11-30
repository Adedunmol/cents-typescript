import { BaseError } from './base';
import { StatusCodes } from 'http-status-codes';

export class UnauthorizedError extends BaseError {
    statusCode: number;
    constructor(message: string) {
        super(message)
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}