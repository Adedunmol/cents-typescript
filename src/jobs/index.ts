import Queue from 'bull'
import { DocumentDefinition } from 'mongoose'
import { InvoiceDocument } from '../models/invoice.model'
import { emailDueDateProcess } from './consumers'

export const mailSendingQueue = new Queue('mail sending', '127.0.0.1:6379')

mailSendingQueue.process('dueDate', emailDueDateProcess)

export const sendMailOnDueDate = async (invoice: DocumentDefinition<InvoiceDocument>) => {
    // confirm this is correct
    if (invoice.dueDate < new Date()) return;
    // format with date-fns
    const delay = new Date().getTime() - new Date(invoice.dueDate).getTime()
    await mailSendingQueue.add('dueDate', { invoiceId: invoice._id }, {
        jobId: `${invoice._id}`,
        delay
    })  
    console.log('Mail on due date sent')
}

export const sendMailsAfterDueDate = async (invoice: DocumentDefinition<InvoiceDocument>) => {
    // confirm this is correct
    if (invoice.dueDate < new Date()) return;

    await mailSendingQueue.add('reminderAfterDueDate', { invoiceId: invoice._id }, {
        jobId: `${invoice._id}`,
        repeat: { cron: '0 0 * * SAT' }
    })  
    console.log('Mail on due date sent')
}