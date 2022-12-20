import { DocumentDefinition, FilterQuery, UpdateQuery } from "mongoose";
import Client, { ClientDocument } from "../models/client.model";
import Invoice from "../models/invoice.model";


export const getAllClients = async (query: FilterQuery<ClientDocument>) => {
    return await Client.find(query).sort('createdAt')
}

export const getClient = async (query: FilterQuery<ClientDocument>) => {
    return await Client.findOne(query).exec()
}

export const createClient = async (input: Omit<DocumentDefinition<ClientDocument>, 'createdAt' | 'updatedAt'>) => {
    try {
        return await Client.create(input)
    }catch (err: any) {
        throw new Error(err)
    }
}

export const deleteInvoices = async (query: FilterQuery<ClientDocument>) => {
    return await Invoice.deleteMany(query)
}

export const deleteClient = async (query: FilterQuery<ClientDocument>) => {
    return await Client.findOneAndDelete(query)
}

export const updateClient = async (query: FilterQuery<ClientDocument>, update: UpdateQuery<ClientDocument>) => {
    return await Client.updateMany(query, update, { new: true, runValidators: true })
}