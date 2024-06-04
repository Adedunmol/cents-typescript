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
        dueDate: string({ required_error: "dueDate is required" }),
        frequency: number({ required_error: "frequency is required" }),
        interval: string({ required_error: "interval is required" })
    })
})


export type invoiceInput = TypeOf<typeof invoiceSchema>