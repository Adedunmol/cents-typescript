"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const validateResource = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body
            });
            next();
        }
        catch (err) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send(err.issues);
        }
    };
};
exports.default = validateResource;
