import { object, string, TypeOf } from "zod";


export const clientSchema = object({
    body: object({
        fullName: string({ required_error: "Client's full name is required" }),
        email: string({ required_error: "Client's email is required" }).email('Should be a valid email'),
        phoneNumber: string({ required_error: "Client's phone number is required" })
    })
})

export const updateClientSchema = object({
    body: object({
        fullName: string().optional(),
        email: string().email('Should be a valid email').optional(),
        phoneNumber: string().optional()
    })
})

export type updateClientInput = TypeOf<typeof updateClientSchema>
export type clientInput = TypeOf<typeof clientSchema>