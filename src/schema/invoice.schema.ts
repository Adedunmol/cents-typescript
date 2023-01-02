import { date, object, number, string, TypeOf, boolean, array } from "zod";

const serviceSchema = object({
    item: string(),
    rate: number(),
    hours: number(),
    paid: boolean()
})

export const invoiceSchema = object({
    body: object({
        services: array(serviceSchema),
        dueDate: string(),
    })
})


export type invoiceInput = TypeOf<typeof invoiceSchema>