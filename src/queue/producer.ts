import { Queue, ConnectionOptions } from 'bullmq'
import logger from "../utils/logger"

export const redisOptions: ConnectionOptions = { 
    username: 'default',
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
}

export const emailQueue = new Queue('emails', { connection: redisOptions }) // { defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } } }
export const invoiceQueue = new Queue('invoices', { connection: redisOptions })

type queueName = 'emails' | 'invoices'

export const sendToQueue = async (queue: queueName, data: any) => {

    switch (queue) {
        case 'emails':
            logger.info('mail added to queue', data)
            await emailQueue.add('send-mail', data, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } })
            break
        case 'invoices':
            logger.info('invoice added to queue', data)
            await invoiceQueue.add('create-invoice', data, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } })
            break
    }
}