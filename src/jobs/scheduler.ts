import { DocumentDefinition } from "mongoose"
import Invoice, { InvoiceDocument } from "../models/invoice.model"

import agenda from "./agendaInstance"
import logger from "../utils/logger"

const splitDate = (dateStr: string) => {
    
    const pattern = new RegExp("(\d{4})[-/]?(\d{2})[-/]?(\d{2})")
    const dates = dateStr.split(pattern)

    if (dates.length < 5) return null

    return { year: dates[1], month: dates[2], day: dates[3] }
}

const scheduler = {
    dueDateMail: async (invoice: DocumentDefinition<InvoiceDocument>, date: string) => {
        const splittedDate = splitDate(date)

        if (!splittedDate) {
            logger.info('early return due to invalid date')
            logger.info(invoice)
            throw new Error('invalid date structure')
        }

        const dueDate = new Date(parseInt(splittedDate.year), parseInt(splittedDate.month) - 1, parseInt(splittedDate.day))
        
        await agenda.schedule(dueDate, 'send-mail-on-due-date', { id: invoice._id })
    },

    reminderMails: async (invoiceId: string) => {
        const invoice = await Invoice.findById(invoiceId)

        if (!invoice) return

        await agenda.every(`${invoice.frequency} ${invoice.interval}`, 'send-reminder-mails', { id: invoiceId })
    }
}

export default scheduler