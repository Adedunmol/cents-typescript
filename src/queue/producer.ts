import './worker'
import { Queue } from 'bullmq'
import logger from "../utils/logger"
import { redisConnOptions } from '.'

export const emailQueue = new Queue('emails', { connection: redisConnOptions, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } } })
export const invoiceQueue = new Queue('invoices', { connection: redisConnOptions, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } } })

type queueName = 'emails' | 'invoices'

export const sendToQueue = async (queue: queueName, data: any) => {

    switch (queue) {
        case 'emails':
            logger.info('mail added to queue')
            await emailQueue.add('send-mail', data, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } })
            break
        case 'invoices':
            logger.info('invoice added to queue', data)
            await invoiceQueue.add('create-invoice', data, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } })
            break
    }
}