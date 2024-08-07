import path from 'path'
import fs from 'fs'
import Invoice from '../models/invoice.model'
import User from '../models/user.model'
import generateInvoice from '../utils/generateInvoice'
import { sendMailWithTemplates } from '../utils/mail'
import agenda from './agendaInstance'
import { formatDistance } from 'date-fns'
import logger from '../utils/logger'


export const sendReminderMailsHandler = async (invoiceId: string) => {
    const invoiceData = await Invoice.findOne({ _id: invoiceId }).exec()

    if (!invoiceData || invoiceData.fullyPaid) {
        logger.info('canceling job due to full payment or invoice not found')
        if (!invoiceData) return;

        const job = await agenda.cancel({ 'data.body.id': invoiceData._id })

        console.log('canceled job')
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

    if (!invoiceData.recurrent) {

        invoiceData.recurrent = true

        await invoiceData.save()
    }

}