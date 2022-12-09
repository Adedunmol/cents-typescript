import { Request, Response } from "express"
import { clientInput, updateClientInput } from "../schema/client.schema"
import { getAllClients, getClient, createClient, deleteInvoices, deleteClient, updateClient } from "../service/client.service"
import { StatusCodes } from 'http-status-codes'
import { BadRequestError } from '../errors'
import { Invoice } from '../models/invoice.model'


export const getAllClientsController = async (req: Request, res: Response) => {
    const createdBy = req.user.id

    const clients = await getAllClients({ createdBy })

    return res.status(StatusCodes.OK).json({ clients, nbHits: clients.length })
}


export const getClientController = async (req: Request, res: Response) => {
    const createdBy = req.user.id
    const { id: clientID } = req.params

    if (!clientID) {
        throw new BadRequestError('no id with url')
    }

    const client = await getClient({ _id: clientID, createdBy })

    return res.status(StatusCodes.OK).json({ client })
}


export const createClientController = async (req: Request<{}, {}, clientInput['body']>, res: Response) => {
    const createdBy = req.user.id

    const clientObj = { ...req.body, createdBy }

    const result = await createClient(clientObj)

    return res.status(StatusCodes.CREATED).json(result)
}


export const deleteClientController = async (req: Request, res: Response) => {
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


export const updateClientController = async (req: Request<{ id: string }, {}, updateClientInput['body']>, res: Response) => {
    const createdBy = req.user.id
    const { id: clientID } = req.params

    if (!clientID) {
        throw new BadRequestError('No id with URL')
    }

    const client = await getClient({ createdBy, _id: clientID })

    if (!client) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'No client with this Id' })
    }

    const invoices = await Invoice.updateMany({ createdFor: clientID, createdBy }, { clientFullName: req.body.fullName, email: req.body.email, phoneNumber: req.body.phoneNumber })
    const updatedClient = await updateClient({ createdBy, _id: clientID }, { email: req.body.email, phoneNumber: req.body.phoneNumber, clientFullName: req.body.fullName })

    return res.status(StatusCodes.OK).json({ client: updatedClient })
}
