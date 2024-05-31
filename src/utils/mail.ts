import { DocumentDefinition } from "mongoose"
import { readFile } from 'fs/promises'
import { compile } from 'handlebars'
import { InvoiceDocument } from "../models/invoice.model"
import path from 'path'
import nodemailer from 'nodemailer'
import logger from "./logger"

const sendMail = async (to: string, subject: string, text: string, html: string, invoice: DocumentDefinition<InvoiceDocument>) => {
    
    const htmlFilePath = await readFile(
        path.join(__dirname, '..', 'public', 'html', html),
        'utf-8'
    );

    const template = compile(htmlFilePath);

    const htmlToSend = template({ id: String(invoice._id).slice(0, 8), clientFullName: invoice.clientFullName });

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    transport.verify((err, success) => {
        if (err) {
            logger.error("mail verification failed: ")
            logger.error(err)
            throw new Error("Can't send mails")
        }
    })

    const mailOptions = {
        from: `Cents 📧 ${process.env.ADMIN}`,
        to: to,
        subject: subject,
        text: text,
        html: htmlToSend,
        // html: html,
        attachments: invoice ? [{
            filename: `${String(invoice._id)}.pdf`,
            path: path.join(__dirname, '..', 'invoices', `${String(invoice._id)}.pdf`),
            contentType: 'application/pdf'
        }] : []
    }

    const result = await transport.sendMail(mailOptions)
    
}

export default sendMail;