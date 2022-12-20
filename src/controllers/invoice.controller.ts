import { Request, Response } from 'express'
import fs from 'fs'
import { invoiceInput } from '../schema/invoice.schema'
import { getClient } from '../service/client.service'
import { createInvoice, findInvoice, getInvoices } from '../service/invoice.service'
const { BadRequestError, NotFound } = require('../errors')
import Client from '../models/client.model'
import { StatusCodes } from 'http-status-codes'
import path from 'path'
import sendMail from '../utils/mail'
import generateInvoice from '../utils/generateInvoice'
import { NotFoundError } from '../errors'
import { findUser } from '../service/auth.service'
const { dateDiffInDays, findSecondsDifference } = require('../utils/differenceInDates')
//const schedule = require('../jobs/schedulers/schedule')
//const mailScheduleOnDueDate = require('../events/reminderMail')


export const createInvoiceController = async (req: Request<{ id: string }, {}, invoiceInput['body']>, res: Response) => {
    const emailJobEvents = req.app.get('emailJobEvents')

    const { id: clientId } = req.params
    const createdBy = req.user.id
    const { services, dueDate } = req.body

    if (!clientId) {
        throw new BadRequestError('ClientId is not included with url')
    }

    const client = await getClient({ _id: clientId })

    if (!client) {
        throw new BadRequestError('No client with this id')
    }

    const total = services.reduce((current, obj) => current + Math.floor(obj.rate * obj.hours), 0)
    
    const invoiceObj = { 
        ...req.body, 
        createdBy, 
        createdFor: clientId, 
        total, 
        clientFullName: client.fullName, 
        clientEmail: client.email, 
        clientPhoneNumber: client.phoneNumber,
    }

    const invoice = await createInvoice(invoiceObj)

    //mailScheduleOnDueDate(invoice, dueDate)
    //schedule.dueDateMail(invoice, dueDate)
    emailJobEvents.emit('dueMail', { invoice, dueDate })

    return res.status(StatusCodes.CREATED).json({ invoice })
}


export const getInvoiceController = async (req: Request, res: Response) => {
    const { id: clientId, invoiceId } = req.params
    const createdBy = req.user.id

    if (!clientId) {
        throw new BadRequestError('ClientId is not included with url')
    }

    const client = await Client.findOne({ _id: clientId }).exec()

    if (!client) {
        throw new NotFound('No client with this id')
    }

    const invoice = await findInvoice({ _id: invoiceId, createdFor: client._id, createdBy })

    if (!invoice) {
        throw new NotFound('No invoice found with this id')
    }

    return res.status(StatusCodes.OK).json({ invoice })
}


export const getClientInvoicesController = async (req: Request, res: Response) => {
    const { id: clientId } = req.params
    const createdBy = req.user.id


    if (!clientId) {
        throw new BadRequestError('ClientId is not included with url')
    }

    const client = await Client.findOne({ _id: clientId }).exec()

    if (!client) {
        throw new NotFound('No client with this id')
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
        throw new NotFound('No client with this id')
    }

    const invoice = await findInvoice({ _id: invoiceId, createdFor: client._id, createdBy })

    if (!invoice) {
        throw new NotFound('No invoice found with this id')
    }

    invoice.services = services || invoice.services
    invoice.fullyPaid = fullyPaid || invoice.fullyPaid
    invoice.dueDate = new Date(dueDate) || invoice.dueDate

    const result = await invoice.save()

    return res.status(StatusCodes.OK).json({ invoice: result })
}


export const sendInvoiceToClientController = async (req: Request<{ id: string }>, res: Response) => {
    const { id: invoiceId } = req.params

    if (!invoiceId) {
        throw new BadRequestError('No invoice id with url')
    }

    const invoice = await findInvoice({ _id: invoiceId })

    if (!invoice) throw new NotFoundError('no invoice with this id found')
    
    if (!invoice) {
        throw new NotFound('No invoice with this id')
    }

    const user = await findUser(String(invoice.createdBy))

    if (!user) throw new NotFoundError('no user found with this id')

    generateInvoice(invoice, path.join(__dirname, '..', 'invoices', `${invoice._id}.pdf`))
    
    //send invoice as mail to the client here
    const subject = `An invoice for the contract for ${user.fullName}`
    const text = `Please check the invoice below:`
    const html = `<p> Please check the invoice below: </p>`
    await sendMail(invoice.clientEmail, subject, text, html, invoice)

    //delete the invoice from the invoices directory
    fs.unlink(path.join(__dirname, '..', 'invoices', `${String(invoice._id)}.pdf`), (err: any) => {
        if (err) throw new Error(err)
    })

    return res.status(StatusCodes.OK).json({ message: 'The Invoice has been sent to the client' })
}
