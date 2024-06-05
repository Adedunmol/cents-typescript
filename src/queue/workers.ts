import amqp from "amqplib";
import logger from "../utils/logger"
import sendMail, { sendMailWithTemplates } from "../utils/mail";
import createInvoice from "../utils/generateInvoice";

export const startInvoiceWorker = async () => {
    try {
        const conn = await amqp.connect("amqp://localhost")
        const channel = await conn.createChannel()
        const queue = "invoices"

        await channel.assertQueue(queue, { durable: true })
        logger.info(`Waiting for messages in ${queue}. To exit press CTRL+C`)

        channel.consume(queue, async msg => {
            if (msg !== null) {
                const invoiceData = JSON.parse(msg.content.toString())
                await createInvoice(invoiceData, invoiceData.path)
            }
        })
    } catch (err: any) {
        logger.error("error starting invoice worker", err)
    }
}

export const startEmailWorker = async () => {
    try {
        const conn = await amqp.connect("amqp://localhost")
        const channel = await conn.createChannel()
        const queue = "emails"

        await channel.assertQueue(queue, { durable: true })
        logger.info(`Waiting for messages in ${queue}. To exit press CTRL+C`)

        channel.consume(queue, async msg => {
            if (msg !== null) {
                const emailData = JSON.parse(msg.content.toString())
                await sendMailWithTemplates(emailData.template, emailData.locals, emailData.to)
            }
        })
    } catch (err: any) {
        logger.error("error starting email worker", err)
    }
}