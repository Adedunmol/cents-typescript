import { DocumentDefinition, FilterQuery } from "mongoose";
import Invoice, { InvoiceDocument } from "../models/invoice.model";


export const createInvoice = async (input: DocumentDefinition<Omit<InvoiceDocument, 'createdAt' | 'updatedAt' | 'fullyPaid'>>) => {
    try {
        return await Invoice.create(input)
    }catch (err: any) {
        throw new Error(err)
    }
}

export const findInvoice = async (query: FilterQuery<InvoiceDocument>) => {
    try {
        return await Invoice.findOne(query)
    }catch (err: any) {

    }
}

export const getInvoices = async (query: FilterQuery<InvoiceDocument>) => {
    try {
        return await Invoice.find(query)
    }catch (err: any) {
        throw new Error(err)
    }
}