import { Job } from "bull";
import { sendReminderMails } from './handlers'

export const emailDueDateProcess = async (job: Job) => {
    await sendReminderMails(job.data.invoiceId, false)
}

export const reminderEmailAfterDueDateProcess = async (job: Job) => {
    await sendReminderMails(job.data.invoiceId, true)
}