import { DocumentDefinition } from "mongoose"
import { InvoiceDocument } from "../models/invoice.model"
import path from 'path'
import nodemailer from 'nodemailer'

const sendMail = async (to: string, subject: string, text: string, html: string, invoice: DocumentDefinition<InvoiceDocument>) => {
    
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mailOptions = {
        from: `Cents 📧 ${process.env.ADMIN}`,
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: invoice ? [{
            filename: `${String(invoice._id)}.pdf`,
            path: path.join(__dirname, '..', 'invoices', `${String(invoice._id)}.pdf`),
            contentType: 'application/pdf'
        }] : []
    }

    const result = await transport.sendMail(mailOptions)
    
}

export default sendMail;