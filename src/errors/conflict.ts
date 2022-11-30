import { BaseError } from './base';
import { StatusCodes } from 'http-status-codes';

export class ConflictError extends BaseError {
    statusCode: number;
    constructor(message: string) {
        super(message)
        this.statusCode = StatusCodes.CONFLICT
    }
}