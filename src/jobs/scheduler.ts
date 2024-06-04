import { DocumentDefinition } from "mongoose"
import Invoice, { InvoiceDocument } from "../models/invoice.model"

import agenda from "./agendaInstance"

const splitDate = (dateStr: string) => {
    
    const pattern = new RegExp("(\d{4})[-/]?(\d{2})[-/]?(\d{2})")
    // const dates = dateStr.split(pattern)
    const match = pattern.exec(dateStr)

    if (match) {
        return match.slice(1)
    } else {
        return null
    }
}

const scheduler = {
    dueDateMail: async (invoice: DocumentDefinition<InvoiceDocument>, date: string) => {
        const splittedDate = splitDate(date)

        if (!splittedDate) {
            return
        }

        const dueDate = new Date(parseInt(splittedDate[0]), parseInt(splittedDate[1]) - 1, parseInt(splittedDate[2]))
        
        await agenda.schedule(dueDate, 'send-mail-on-due-date', { id: invoice._id })
    },

    reminderMails: async (invoiceId: string) => {
        const invoice = await Invoice.findById(invoiceId)

        if (!invoice) return

        await agenda.every(`${invoice.frequency} ${invoice.interval}`, 'send-reminder-mails', { id: invoiceId })
    }
}

export default scheduler