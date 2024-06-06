import { Queue } from 'bullmq'
// import bull-board

export const emailQueue = new Queue('emails') // { defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } } }
export const invoiceQueue = new Queue('invoices')

type queueName = 'emails' | 'invoices'

export const sendToQueue = async (queue: queueName, data: any) => {

    switch (queue) {
        case 'emails':
            await emailQueue.add('send-mail', data, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } })
            break
        case 'invoices':
            await invoiceQueue.add('create-invoice', data, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } })
            break
    }
}
