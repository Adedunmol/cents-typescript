"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.resendOTPSchema = exports.verifyOTPSchema = exports.loginSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        username: (0, zod_1.string)({ required_error: 'username is required' }),
        fullName: (0, zod_1.string)({ required_error: 'Full name is required' }),
        email: (0, zod_1.string)({ required_error: 'Email is required' }).email('Should be a valid email'),
        password: (0, zod_1.string)({ required_error: 'Password is required' }).min(6, 'Password too short - should be more than 6 characters'),
        passwordConfirmation: (0, zod_1.string)({ required_error: 'Password Confirmation is required' }),
        roles: (0, zod_1.object)({
            User: (0, zod_1.number)().default(1984),
            Admin: (0, zod_1.number)().optional(),
            Moderator: (0, zod_1.number)().optional()
        })
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: 'Passwords do not match',
        path: ['passwordConfirmation']
    })
});
exports.loginSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        email: (0, zod_1.string)({ required_error: 'Email is required' }),
        password: (0, zod_1.string)({ required_error: 'Password is required' })
    })
});
exports.verifyOTPSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        userId: (0, zod_1.string)({ required_error: "userId is required" }),
        otp: (0, zod_1.string)({ required_error: "otp is required" })
    })
});
exports.resendOTPSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        userId: (0, zod_1.string)({ required_error: "userId is required" }),
        email: (0, zod_1.string)({ required_error: "email is required" })
    })
});
exports.forgotPasswordSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        email: (0, zod_1.string)({ required_error: "email is required" }),
    })
});
exports.resetPasswordSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        email: (0, zod_1.string)({ required_error: "email is required" }),
        otp: (0, zod_1.string)({ required_error: "otp is required" }),
        password: (0, zod_1.string)({ required_error: "password is required" }).min(6, "Password too short - should be 6 chars minimum"),
        passwordConfirmation: (0, zod_1.string)({ required_error: "passwordConfirmation is required" }),
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: "Passwords do not match",
        path: ["passwordConfirmation"]
    })
});
