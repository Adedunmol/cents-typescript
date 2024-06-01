import { DocumentDefinition } from "mongoose"
import { readFile } from 'fs/promises'
import { compile, log } from 'handlebars'
import { InvoiceDocument } from "../models/invoice.model"
import path from 'path'
import nodemailer from 'nodemailer'
import logger from "./logger"
import amqp from "amqplib";

export const sendToQueue = async (emailData: any) => {
    const conn = await amqp.connect("amqp://localhost")
    const channel = await conn.createChannel()
    const queue = "emails"

    await channel.assertQueue(queue, { durable: true })

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(emailData)), { persistent: true })

    logger.info("Email request sent to queue")
    setTimeout(() => {
        channel.close()
        conn.close()
    }, 500)
}

export const startWorker = async () => {
    try {
        const conn = await amqp.connect("amqp://localhost")
        const channel = await conn.createChannel()
        const queue = "emails"

        await channel.assertQueue(queue, { durable: true })
        logger.info(`Waiting for messages in ${queue}. To exit press CTRL+C`)

        channel.consume(queue, async msg => {
            if (msg !== null) {
                const emailData = JSON.parse(msg.content.toString())
                await sendMail(emailData)
            }
        })
    } catch (err: any) {
        logger.error("error starting worker")
    }
}

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
            logger.error("mail verification failed: ")
            logger.error(err)
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