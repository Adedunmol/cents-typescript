import { DocumentDefinition } from "mongoose"
import { InvoiceDocument } from "../models/invoice.model"

import agenda from "./agendaInstance"


const scheduler = {
    dueDateMail: async (invoice: DocumentDefinition<InvoiceDocument>, date: Date) => {
        // parse the date using date-fns
        const dueDate = new Date(date)
        
        await agenda.schedule(dueDate, 'send-mail-on-due-date', { id: invoice._id })
    },

    reminderMails: async (invoiceId: string) => {
        
        await agenda.every('1 week', 'send-reminder-mails', { id: invoiceId })
    }
}

export default scheduler