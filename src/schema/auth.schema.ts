import { object, string, TypeOf, boolean, number } from 'zod';

export const createUserSchema = object({
    body: object({
        fullName: string({ required_error: 'Full name is required' }),
        email: string({ required_error: 'Email is required' }).email('Should be a valid email'),
        password: string({ required_error: 'Password is required' }).min(6, 'Password too short - should be more than 6 characters'),
        passwordConfirmation: string({ required_error: 'Password is required' }),
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

export type createUserInput = Omit<TypeOf<typeof createUserSchema>, 'body.passwordConfirmation'>