import { DocumentDefinition } from "mongoose"
import Invoice, { InvoiceDocument } from "../models/invoice.model"

import agenda from "./agendaInstance"

const scheduler = {
    dueDateMail: async (invoice: DocumentDefinition<InvoiceDocument>, date: Date) => {
        
        await agenda.schedule(date, 'send-mail-on-due-date', { id: invoice._id })
    },

    reminderMails: async (invoiceId: string) => {
        const invoice = await Invoice.findById(invoiceId)

        if (!invoice) return

        await agenda.every(`${invoice.frequency} ${invoice.interval}`, 'send-reminder-mails', { id: invoiceId })
    }
}

export default scheduler