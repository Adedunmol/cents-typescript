import { Job } from "agenda"
import { sendReminderMailsHandler } from "./mailHandlers"
import scheduler from "./scheduler"
import logger from "../utils/logger"

const jobHandlers = {
    sendMailOnDueDate: async (job: Job) => { 
    
        logger.info('Running due date mail')
        const invoiceId = job.attrs.data.id 

        await sendReminderMailsHandler(invoiceId)
        await scheduler.reminderMails(invoiceId)

        console.log('due date mail job done')
    },

    sendReminderMails: async (job: Job) => {

        logger.info('Running reminder mail')
        const invoiceId = job.attrs.data.id
        console.log(`Reminder mail: ${invoiceId}`)

        await sendReminderMailsHandler(invoiceId)

        console.log('reminder mail job done')
    }
}


export default jobHandlers;