import amqp from "amqplib";
import logger from "../utils/logger"
import { startEmailWorker, startInvoiceWorker } from "./workers";

const workers = [startEmailWorker, startInvoiceWorker]

export const sendToQueue = async (queue: string, data: any) => {
    const conn = await amqp.connect("amqp://localhost")
    const channel = await conn.createChannel()

    await channel.assertQueue(queue, { durable: true })

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true })

    logger.info(`${queue} request sent to queue`)
    setTimeout(() => {
        channel.close()
        conn.close()
    }, 500)
}

export const startWorkers = async () => {
    for (const worker of workers) {
        worker()
    }
}