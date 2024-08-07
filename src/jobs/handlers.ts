import { Job } from "agenda"
import { sendReminderMailsHandler } from "./mailHandlers"
import scheduler from "./scheduler"

const jobHandlers = {
    sendMailOnDueDate: async (job: Job) => { 
    
        console.log(`Running at: ${Date()}`)
        const invoiceId = job.attrs.data.id 

        await sendReminderMailsHandler(invoiceId)
        await scheduler.reminderMails(invoiceId)

        console.log('job done')
    },

    sendReminderMails: async (job: Job) => {

        console.log(`Running reminder mail at: ${Date()}`)
        const invoiceId = job.attrs.data.id
        console.log(`Reminder mail: ${invoiceId}`)

        await sendReminderMailsHandler(invoiceId)

        console.log('reminder mail done')
    }
}


export default jobHandlers;