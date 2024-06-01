import { DocumentDefinition } from "mongoose"
import { readFile } from 'fs/promises'
import { compile, log } from 'handlebars'
import { InvoiceDocument } from "../models/invoice.model"
import path from 'path'
import nodemailer from 'nodemailer'
import logger from "./logger"


interface emailData {
    to: string
    subject: string
    text: string
    html: string
    invoice: DocumentDefinition<InvoiceDocument>
}

const sendMail = async (emailData: emailData) => {
    
    const htmlFilePath = await readFile(
        path.join(__dirname, '..', 'public', 'html', emailData.html),
        'utf-8'
    );

    const template = compile(htmlFilePath);

    const htmlToSend = template({ id: String(emailData.invoice._id).slice(0, 8), clientFullName: emailData.invoice.clientFullName });

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    transport.verify((err, success) => {
        if (err) {
            logger.error("mail verification failed")
            throw new Error("Can't send mails")
        }
    })

    const mailOptions = {
        from: `Cents 📧 ${process.env.ADMIN}`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: htmlToSend,
        // html: html,
        attachments: emailData.invoice ? [{
            filename: `${String(emailData.invoice._id)}.pdf`,
            path: path.join(__dirname, '..', 'invoices', `${String(emailData.invoice._id)}.pdf`),
            contentType: 'application/pdf'
        }] : []
    }

    const result = await transport.sendMail(mailOptions)
    
}

export default sendMail;