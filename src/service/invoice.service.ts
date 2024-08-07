import { DocumentDefinition, FilterQuery, UpdateQuery } from "mongoose";
import Invoice, { InvoiceDocument } from "../models/invoice.model";


export const createInvoice = async (input: DocumentDefinition<Omit<InvoiceDocument, 'createdAt' | 'updatedAt' | 'fullyPaid' | 'recurrent'>>) => {
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

export const updateInvoices = async (query: FilterQuery<InvoiceDocument>, update: UpdateQuery<InvoiceDocument>) => {
    return await Invoice.updateMany(query, update)
}

export const findAndUpdateInvoice = async (query: FilterQuery<InvoiceDocument>, update: UpdateQuery<InvoiceDocument>) => {
    return await Invoice.findOneAndUpdate(query, update, { new: true, runValidators: true })
}