import { object, string, TypeOf, number } from 'zod';

export const createUserSchema = object({
    body: object({
        fullName: string({ required_error: 'Full name is required' }),
        email: string({ required_error: 'Email is required' }).email('Should be a valid email'),
        password: string({ required_error: 'Password is required' }).min(6, 'Password too short - should be more than 6 characters'),
        passwordConfirmation: string({ required_error: 'Password Confirmation is required' }),
        roles: object({
            User: number().default(1984),
            Admin: number().optional(),
            Moderator: number().optional()
        })
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: 'Passwords do not match',
        path: ['passwordConfirmation']
    })
})

export const loginSchema = object({
    body: object({
        email: string({ required_error: 'Email is required' }),
        password: string({ required_error: 'Password is required' })
    })
})

export const verifyOTPSchema = object({
    body: object({
        userId: string({ required_error: "userId is required" }),
        otp: string({ required_error: "otp is required" })
    })
})
export const resendOTPSchema = object({
    body: object({
        userId: string({ required_error: "userId is required" }),
        email: string({ required_error: "email is required" })
    })
})

export const forgotPasswordSchema = object({
    body: object({
        email: string({ required_error: "email is required" }),
    })
})

export const resetPasswordSchema = object({
    body: object({
        email: string({ required_error: "email is required" }),
        otp: string({ required_error: "otp is required" }),
        password: string({ required_error: "password is required" }).min(6, "Password too short - should be 6 chars minimum"),
        passwordConfirmation: string({ required_error: "passwordConfirmation is required" }),
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: "Passwords do not match",
        path: ["passwordConfirmation"]
    })
})

export type loginUserInput = TypeOf<typeof loginSchema>
export type createUserInput = Omit<TypeOf<typeof createUserSchema>, 'body.passwordConfirmation'>
export type VerifyOTPInput = TypeOf<typeof verifyOTPSchema>;
export type ResendOTPInput = TypeOf<typeof resendOTPSchema>;
export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>;
export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;