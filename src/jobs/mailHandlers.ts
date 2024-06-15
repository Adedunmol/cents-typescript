import path from 'path'
import fs from 'fs'
import Invoice from '../models/invoice.model'
import User from '../models/user.model'
import generateInvoice from '../utils/generateInvoice'
import sendMail, { sendMailWithTemplates } from '../utils/mail'
import emailJobEvents from '../events'
import agenda from './agendaInstance'
import { formatDistance } from 'date-fns'
import scheduler from './scheduler'


export const sendReminderMailsHandler = async (invoiceId: string, recurrent: boolean) => {
    const invoiceData = await Invoice.findOne({ _id: invoiceId }).exec()
        
    if (!invoiceData || invoiceData.fullyPaid) {

        if (!invoiceData) return;

        const job = await agenda.cancel({ 'data.body.id': invoiceData._id })

        console.log('cancelling job')
        return;
    }

    const user = await User.findOne({ _id : invoiceData.createdBy }).exec()

    const invoicePath = path.join(__dirname, '..', 'invoices', `${invoiceData._id}.pdf`)
    await generateInvoice(invoiceData, invoicePath)
    
    const dueDate = formatDistance(new Date(invoiceData.dueDate), Date.now(), { addSuffix: true })

    //sending the invoice to the client here
    await sendMailWithTemplates("invoice", { id: invoiceData.id, ...invoiceData.toJSON(), dueDate }, invoiceData.clientEmail, invoicePath, invoiceData.id)

    //the invoice pdf is to be deleted from the invoices directory after sending to the client    
    fs.unlink(invoicePath, (err: any) => {
        if (err) throw err
        console.log('file has been deleted')
    })

    // if (recurrent) emailJobEvents.emit('send-reminder-mails', invoiceId)
    await scheduler.reminderMails(invoiceData.id)
}