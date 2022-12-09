import { DocumentDefinition } from "mongoose";
import { Invoice, InvoiceDocument } from "../models/invoice.model";


export const createInvoice = async (input: DocumentDefinition<Omit<InvoiceDocument, 'createdAt' | 'updatedAt' | 'fullyPaid'>>) => {
    try {
        return await Invoice.create(input)
    }catch (err: any) {
        throw new Error(err)
    }
}