"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientSchema = exports.clientSchema = void 0;
const zod_1 = require("zod");
exports.clientSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        fullName: (0, zod_1.string)({ required_error: "Client's full name is required" }),
        email: (0, zod_1.string)({ required_error: "Client's email is required" }).email('Should be a valid email'),
        phoneNumber: (0, zod_1.string)({ required_error: "Client's phone number is required" })
    })
});
exports.updateClientSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        fullName: (0, zod_1.string)().optional(),
        email: (0, zod_1.string)().email('Should be a valid email').optional(),
        phoneNumber: (0, zod_1.string)().optional()
    })
});
