import { object, string, TypeOf } from 'zod';

export const updateUserSchema = object({
    body: object({
        fullName: string(),
        email: string().email('Should be a valid email'),
    })
})

export type updateUserInput = TypeOf<typeof updateUserSchema>