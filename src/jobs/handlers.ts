import path from 'path'
import fs from 'fs'
import Invoice from '../models/invoice.model'
import User from '../models/user.model'
import generateInvoice from '../utils/generateInvoice'
import sendMail from '../utils/mail'
import { mailSendingQueue } from '.'
import emailJobEvents from '../events'

export const sendReminderMails = async (invoiceId: string, recurrent: boolean) => {
    const invoiceData = await Invoice.findOne({ _id: invoiceId }).exec()
        
    if (!invoiceData || invoiceData.fullyPaid) {

        if (!invoiceData) return;

        const job = await mailSendingQueue.getJob(invoiceData?._id)

        console.log('cancelling job')
        await job?.remove()
        return;
    }

    const user = await User.findOne({ _id : invoiceData.createdBy }).exec()

    generateInvoice(invoiceData, path.join(__dirname, '..', 'invoices', `${invoiceData._id}.pdf`))
    
    //sending the invoice to the client here
    const subject = `An invoice for the contract for ${user?.fullName}`
    const text = `Please check the invoice below:`
    const html = `<p> Please check the invoice below: </p>`
    await sendMail(invoiceData.clientEmail, subject, text, html, invoiceData)

    //the invoice pdf is to be deleted from the invoices directory after sending to the client
    const filePath = path.join(__dirname, '..', 'invoices', `${invoiceData._id}.pdf`)
    
    fs.unlink(filePath, (err: any) => {
        if (err) throw err
        console.log('file has been deleted')
    })

    if (recurrent) emailJobEvents.emit('send-reminder-mails', invoiceId)

}