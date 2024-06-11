import { Request, Response } from "express"
import { clientInput, updateClientInput } from "../schema/client.schema"
import { getAllClients, getClient, createClient, deleteInvoices, deleteClient, updateClient } from "../service/client.service"
import { StatusCodes } from 'http-status-codes'
import { BadRequestError } from '../errors'
import { updateInvoices } from "../service/invoice.service"


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

    if (!client) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Client not found' })

    return res.status(StatusCodes.OK).json({ client })
}


export const createClientController = async (req: Request<{}, {}, clientInput['body']>, res: Response) => {
    const createdBy = req.user.id

    const clientObj = { ...req.body, createdBy }

    const result = await createClient(clientObj)

    return res.status(StatusCodes.CREATED).json({ client: result })
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

    const invoices = await deleteInvoices({ $and: [{ createdBy }, { createdFor: clientID}] })
    const client = await deleteClient({ $and: [{ createdBy }, { _id: clientID }] })

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

    const invoices = await updateInvoices({ createdFor: clientID, createdBy }, { clientFullName: req.body.fullName, ...req.body })
    const updatedClient = await updateClient({ createdBy, _id: clientID }, { clientFullName: req.body.fullName, ...req.body })

    return res.status(StatusCodes.OK).json({ client: updatedClient })
}
