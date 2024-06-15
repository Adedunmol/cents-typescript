"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const base_1 = require("./base");
const http_status_codes_1 = require("http-status-codes");
class ConflictError extends base_1.BaseError {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.StatusCodes.CONFLICT;
    }
}
exports.ConflictError = ConflictError;
