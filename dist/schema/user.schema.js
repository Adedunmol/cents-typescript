"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = void 0;
const zod_1 = require("zod");
exports.updateUserSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        fullName: (0, zod_1.string)(),
        email: (0, zod_1.string)().email('Should be a valid email'),
    })
});
