"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = void 0;
const base_1 = require("./base");
const http_status_codes_1 = require("http-status-codes");
class InternalServerError extends base_1.BaseError {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
    }
}
exports.InternalServerError = InternalServerError;
