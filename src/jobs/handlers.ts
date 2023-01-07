import { Job } from "agenda"
import { sendReminderMailsHandler } from "./mailHandlers"

const jobHandlers = {
    sendMailOnDueDate: async (job: Job) => { 
    
        console.log(`Running at: ${Date()}`)
        const invoiceId = job.attrs.data.id 

        await sendReminderMailsHandler(invoiceId, false)

        console.log('job done')
    },

    sendReminderMails: async (job: Job) => {

        const invoiceId = job.attrs.data.id
        console.log(`Reminder mails: ${invoiceId}`)

        await sendReminderMailsHandler(invoiceId, true)

        console.log('reminder mails done')
    }
}


export default jobHandlers;