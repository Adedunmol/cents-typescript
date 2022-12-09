import { Request, Response } from 'express'
import fs from 'fs'
import { invoiceInput } from '../schema/invoice.schema'
import { getClient } from '../service/client.service'
import { createInvoice } from '../service/invoice.service'
const { BadRequestError, NotFound } = require('../errors')
const Client = require('../models/Client')
const Invoice = require('../models/Invoice')
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const path = require('path')
const sendMail = require('../config/mail')
const emailJobEvents = require('../events')
const generateInvoice = require('../utils/generateInvoice')
const { dateDiffInDays, findSecondsDifference } = require('../utils/differenceInDates')
//const schedule = require('../jobs/schedulers/schedule')
//const mailScheduleOnDueDate = require('../events/reminderMail')


const createInvoiceController = async (req: Request<{ id: string }, {}, invoiceInput['body']>, res: Response) => {
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

    const newDueDate = new Date(dueDate)

    console.log(`Current date: ${new Date()}`)
    const interval = dateDiffInDays(new Date(), newDueDate) > 0 ? `${dateDiffInDays(new Date(), newDueDate)} days` : `${findSecondsDifference(new Date(), newDueDate)} seconds`
    console.log(`${interval}`)
    
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


const getInvoice = async (req: Request, res: Response) => {
    const { id: clientId, invoiceId } = req.params
    const createdBy = req.user.id

    if (!clientId) {
        throw new BadRequestError('ClientId is not included with url')
    }

    const client = await Client.findOne({ _id: clientId }).exec()

    if (!client) {
        throw new NotFound('No client with this id')
    }

    const invoice = await Invoice.findOne({ _id: invoiceId, createdFor: client._id, createdBy }).exec()

    if (!invoice) {
        throw new NotFound('No invoice found with this id')
    }

    return res.status(StatusCodes.OK).json({ invoice })
}


const getClientInvoices = async (req: Request, res: Response) => {
    const { id: clientId } = req.params
    const createdBy = req.user.id


    if (!clientId) {
        throw new BadRequestError('ClientId is not included with url')
    }

    const client = await Client.findOne({ _id: clientId }).exec()

    if (!client) {
        throw new NotFound('No client with this id')
    }

    const invoices = await Invoice.find({ createdFor: client._id, createdBy }).exec()

    
    return res.status(StatusCodes.OK).json({ invoices, nbHits: invoices.length })
}


const getAllInvoices = async (req: Request, res: Response) => {
    const createdBy = req.user.id

    const invoices = await Invoice.find({ createdBy }).exec()

    return res.status(StatusCodes.OK).json({ invoices, nbHits: invoices.length })
}


const updateInvoice = async (req: Request, res: Response) => {
    const { id: clientId, invoiceId } = req.params
    const createdBy = req.user.id
    const { services, fullyPaid, dueDate } = req.body


    if (!clientId) {
        throw new BadRequestError('ClientId is not included with url')
    }

    const client = await Client.findOne({ _id: clientId }).exec()

    if (!client) {
        throw new NotFound('No client with this id')
    }

    const invoice = await Invoice.findOne({ _id: invoiceId, createdFor: client._id, createdBy }).exec()

    if (!invoice) {
        throw new NotFound('No invoice found with this id')
    }

    invoice.services = services || invoice.services
    invoice.fullyPaid = fullyPaid || invoice.fullyPaid
    invoice.dueDate = new Date(dueDate) || invoice.dueDate

    const result = await invoice.save()

    return res.status(StatusCodes.OK).json({ invoice: result })
}


const sendInvoiceToClient = async (req: Request, res: Response) => {
    const { id: invoiceId } = req.params

    if (!clientId) {
        throw new BadRequestError('No invoice id with url')
    }

    const invoice = await Invoice.findOne({ _id: invoiceId }).exec()

    const user = await User.findOne({ _id: invoice.createdBy }).exec()

    if (!invoice) {
        throw new NotFound('No invoice with this id')
    }

    generateInvoice(invoice, path.join(__dirname, '..', 'invoices', `${invoice._id}.pdf`))
    
    //send invoice as mail to the client here
    const subject = `An invoice for the contract for ${user.fullName}`
    const text = `Please check the invoice below:`
    const html = `<p> Please check the invoice below: </p>`
    await sendMail(invoice.clientEmail, subject, text, html, invoice)

    //delete the invoice from the invoices directory
    fs.unlink(path.join(__dirname, '..', 'invoices', `${String(invoice._id)}.pdf`), (err) => {
        if (err) throw new Error(err)
    })

    return res.status(StatusCodes.OK).json({ message: 'The Invoice has been sent to the client' })
}
