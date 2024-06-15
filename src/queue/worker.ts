import { Worker } from 'bullmq'
import logger from "../utils/logger"
import { sendMailWithTemplates } from "../utils/mail";
import createInvoice from "../utils/generateInvoice";
import path from "path"
import fs from "fs"
import { redisConnOptions, connection } from '.';

const emailWorker = new Worker('emails', async job => {
    try {
        console.log(job.data)

        const emailData = job.data
        logger.info(`Sending mail to ${emailData.to}`)
        await sendMailWithTemplates(emailData.template, emailData.locals, emailData.to)
    } catch (err: any) {
        logger.error('error sending mail from worker', err)
    }
}, { connection })

emailWorker.on('completed', job => {
    logger.info(`${job.id} has completed`)
})

emailWorker.on('failed', (job, err) => {
    logger.info(`${job!!.id} has failed due to ${err.message}`)
})

const invoiceWorker = new Worker('invoices', async job => {
    try {
        
        console.log(job.data)
        const invoiceData = job.data

        await createInvoice(invoiceData.invoice, invoiceData.invoicePath)

        if (invoiceData.sendToEmail) {
            await sendMailWithTemplates("invoice", { invoice: invoiceData.invoice, dueDate: invoiceData.dueDate }, invoiceData.invoice.clientEmail, invoiceData.invoicePath, invoiceData.invoice._id)
        }

        fs.unlink(invoiceData.invoicePath, (err: any) => { // path.join(__dirname, '..', 'invoices', `${String(invoiceData.invoice._id)}.pdf`)
            if (err) throw new Error(err)
        })
    } catch (err: any) {
        logger.error('error generating invoice from worker', err)
    }
}, { connection }) // , { connection: { host: 'localhost', port: 6379 } }

invoiceWorker.on('completed', job => {
    logger.info(`${job.id} has completed`)
})

invoiceWorker.on('failed', (job, err) => {
    logger.info(`${job!!.id} has failed due to ${err.message}`)
})