import { Request, Response } from "express"
import { InvoiceDocument } from "../models/invoice.model"
import { clientInput, updateClientInput } from "../schema/client.schema"
import { getAllClients, getClient, createClient, deleteInvoices, deleteClient } from "../service/client.service"

const { StatusCodes } = require('http-status-codes')
const { UnauthorizedError, BadRequestError } = require('../errors')
const Client = require('../models/Client')
const Invoice = require('../models/Invoice')


const getAllClientsController = async (req: Request, res: Response) => {
    const createdBy = req.user.id

    const clients = await getAllClients({ createdBy })

    return res.status(StatusCodes.OK).json({ clients, nbHits: clients.length })
}


const getClientController = async (req: Request, res: Response) => {
    const createdBy = req.user.id
    const { id: clientID } = req.params

    if (!clientID) {
        throw new BadRequestError('no id with url')
    }

    const client = await getClient({ _id: clientID, createdBy })

    return res.status(StatusCodes.OK).json({ client })
}


const createClientController = async (req: Request<{}, {}, clientInput['body']>, res: Response) => {
    const createdBy = req.user.id

    const clientObj = { ...req.body, createdBy }

    const result = await createClient(clientObj)

    return res.status(StatusCodes.CREATED).json(result)
}


const deleteClientController = async (req: Request, res: Response) => {
    const createdBy = req.user.id
    const { id: clientID } = req.params

    if (!clientID) {
        throw new BadRequestError('No id with URL')
    }

    const foundClient = await getClient({ _id: clientID })

    if (!foundClient) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'No client with this Id' })
    }

    const invoices = await deleteInvoices({ createdBy, createdFor: clientID })
    const client = await deleteClient({ createdBy, _id: clientID })

    return res.status(StatusCodes.OK).json({ message: 'Client has been deleted' })
}


const updateClientController = async (req: Request<{ id: string }, {}, updateClientInput['body']>, res: Response) => {
    const createdBy = req.user.id
    const { id: clientID } = req.params

    if (!clientID) {
        throw new BadRequestError('No id with URL')
    }

    const client = await getClient({ createdBy, _id: clientID })

    if (!client) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'No client with this Id' })
    }

    const invoices = await Invoice.find({ createdFor: clientID, createdBy }).exec()

    const newInvoices = invoices.forEach((invoice: InvoiceDocument) => {
        invoice.clientFullName = req.body.fullName || client.fullName
        invoice.clientEmail = req.body.email || client.email
        invoice.clientPhoneNumber = req.body.phoneNumber || client.phoneNumber
    })
    
    client.fullName = req.body.fullName || client.fullName
    client.email = req.body.email || client.email
    client.phoneNumber = req.body.phoneNumber || client.phoneNumber

    const clientResult = await client.save()

    if (!newInvoices) {
        //there are no invoices associated with the client 
    }else {
        const invoiceResult = await newInvoices.save()
    }

    return res.status(StatusCodes.OK).json({ client: clientResult })
}
