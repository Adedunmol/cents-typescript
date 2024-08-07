import { BaseError } from './base';
import { StatusCodes } from 'http-status-codes';

export class InternalServerError extends BaseError {
    statusCode: number;
    constructor(message: string) {
        super(message)
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    }
}