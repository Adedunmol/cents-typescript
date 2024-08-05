import { Request, Response } from 'express'
import fs from 'fs'
import { invoiceInput } from '../schema/invoice.schema'
import { getClient } from '../service/client.service'
import { createInvoice, findAndUpdateInvoice, findInvoice, getInvoices } from '../service/invoice.service'
import { BadRequestError, NotFoundError } from '../errors'
import { StatusCodes } from 'http-status-codes'
import path from 'path'
import { findUserByEmail, findUserById } from '../service/auth.service'
import { formatDistance, isBefore } from 'date-fns'
import { sendToQueue } from '../queue/producer'
import scheduler from '../jobs/scheduler'
import logger from '../utils/logger'

const splitDate = (dateStr: string) => {
    const pattern = /(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/gm
    const dates = dateStr.split(pattern)

    if (dates.length < 5) return null

    return { year: dates[1], month: dates[2], day: dates[3] }
}

export const createInvoiceController = async (req: Request<{ id: string }, {}, invoiceInput['body']>, res: Response) => {
    // const emailJobEvents = req.app.get('emailJobEvents')

    const createdBy = req.user.id
    let { services, dueDate, clientId } = req.body

    const splittedDate = splitDate(dueDate)

    if (!splittedDate) {
        logger.info('early return due to invalid date')
        throw new BadRequestError('invalid date structure')
    }

    const formattedDueDate = new Date(Number(splittedDate.year), Number(splittedDate.month) - 1, Number(splittedDate.day), 20, 48)

    console.log('due date: ', formattedDueDate)
    console.log('current date: ', new Date())

    if (isNaN(formattedDueDate.getTime())) throw new BadRequestError('Date is not valid')

    // first date (due date) has to be greater than or equal to the current date
    if (isBefore(formattedDueDate, new Date())) throw new BadRequestError('The due date can\'t be before the current date, try a future date.')

    if (!clientId) {
        throw new BadRequestError('ClientId is not included with url')
    }

    const client = await getClient({ _id: clientId })

    if (!client) {
        throw new BadRequestError('No client with this id')
    }

    const total = services.reduce((current, obj) => current + Math.floor(obj.rate * obj.hours), 0)
    
    dueDate = new Date(dueDate).toISOString()

    const invoiceObj = { 
        ...req.body, 
        dueDate: formattedDueDate,
        createdBy, 
        createdFor: clientId, 
        total, 
        clientFullName: client.fullName, 
        clientEmail: client.email, 
        clientPhoneNumber: client.phoneNumber,
    }

    const invoice = await createInvoice(invoiceObj)
    //mailScheduleOnDueDate(invoice, dueDate)
    await scheduler.dueDateMail(invoice, formattedDueDate)
    // emailJobEvents.emit('dueMail', { invoice, dueDate })
    // sendToQueue("invoices", invoice)

    return res.status(StatusCodes.CREATED).json({ invoice })
}


export const getInvoiceController = async (req: Request, res: Response) => {
    const { id: clientId, invoiceId } = req.params
    const createdBy = req.user.id

    if (!clientId) {
        throw new BadRequestError('ClientId is not included with url')
    }

    const client = await getClient({ _id: clientId })

    if (!client) {
        throw new NotFoundError('No client with this id')
    }

    const invoice = await findInvoice({ _id: invoiceId, createdFor: client._id, createdBy })

    if (!invoice) {
        throw new NotFoundError('No invoice found with this id')
    }

    return res.status(StatusCodes.OK).json({ invoice })
}


export const getClientInvoicesController = async (req: Request, res: Response) => {
    const { clientId } = req.params
    const createdBy = req.user.id


    if (!clientId) {
        throw new BadRequestError('ClientId is not included with url')
    }

    const client = await getClient({ _id: clientId })

    if (!client) {
        throw new NotFoundError('No client with this id')
    }

    const invoices = await getInvoices({ createdFor: client._id, createdBy })

    
    return res.status(StatusCodes.OK).json({ invoices, nbHits: invoices.length })
}


export const getAllInvoicesController = async (req: Request, res: Response) => {
    const createdBy = req.user.id

    const invoices = await getInvoices({ createdBy })

    if (!invoices) return res.status(StatusCodes.OK).send({ invoices: [], nbHits: 0 })

    return res.status(StatusCodes.OK).json({ invoices, nbHits: invoices.length })
}


export const updateInvoiceController = async (req: Request, res: Response) => {
    const { id: clientId, invoiceId } = req.params
    const createdBy = req.user.id
    const { services, fullyPaid, dueDate } = req.body


    if (!clientId) {
        throw new BadRequestError('ClientId is not included with url')
    }

    const client = await getClient({ _id: clientId })

    if (!client) {
        throw new NotFoundError('No client with this id')
    }

    const invoice = await findAndUpdateInvoice({ _id: invoiceId, createdFor: client._id, createdBy }, req.body)

    if (!invoice) {
        throw new NotFoundError('No invoice found with this id')
    }

    // const result = await invoice.save()

    return res.status(StatusCodes.OK).json({ invoice })
}


export const sendInvoiceToClientController = async (req: Request<{ id: string }>, res: Response) => {
    const { id: invoiceId } = req.params

    if (!invoiceId) {
        throw new BadRequestError('No invoice id with url')
    }

    const invoice = await findInvoice({ _id: invoiceId })

    if (!invoice) throw new NotFoundError('no invoice with this id found')
    
    if (!invoice) {
        throw new NotFoundError('No invoice with this id')
    }

    const user = await findUserById(String(invoice.createdBy))

    if (!user) throw new NotFoundError('no user found with this id')

    const dueDate = formatDistance(new Date(invoice.dueDate), Date.now(), { addSuffix: true })

    const invoiceData = {
        sendToEmail: true,
        invoice,
        invoicePath: path.join(__dirname, '..', 'invoices', `${invoice._id}.pdf`),
        dueDate
    }

    await sendToQueue('invoices', invoiceData)

    return res.status(StatusCodes.OK).json({ message: 'The Invoice has been sent to the client' })
}
