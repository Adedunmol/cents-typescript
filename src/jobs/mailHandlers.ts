import path from 'path'
import fs from 'fs'
import Invoice from '../models/invoice.model'
import User from '../models/user.model'
import generateInvoice from '../utils/generateInvoice'
import sendMail from '../utils/mail'
import emailJobEvents from '../events'
import agenda from './agendaInstance'


export const sendReminderMailsHandler = async (invoiceId: string, recurrent: boolean) => {
    const invoiceData = await Invoice.findOne({ _id: invoiceId }).exec()
        
    if (!invoiceData || invoiceData.fullyPaid) {

        if (!invoiceData) return;

        const job = await agenda.cancel({ 'data.body.id': invoiceData._id })

        console.log('cancelling job')
        return;
    }

    const user = await User.findOne({ _id : invoiceData.createdBy }).exec()

    generateInvoice(invoiceData, path.join(__dirname, '..', 'invoices', `${invoiceData._id}.pdf`))
    
    //sending the invoice to the client here
    const subject = `${user?.fullName}'s invoice: Payment due today`
    const text = `Please check the invoice below:`
    await sendMail(invoiceData.clientEmail, subject, text, 'invoice.hbs', invoiceData)

    //the invoice pdf is to be deleted from the invoices directory after sending to the client
    const filePath = path.join(__dirname, '..', 'invoices', `${invoiceData._id}.pdf`)
    
    fs.unlink(filePath, (err: any) => {
        if (err) throw err
        console.log('file has been deleted')
    })

    if (recurrent) emailJobEvents.emit('send-reminder-mails', invoiceId)

}