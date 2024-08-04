import { DocumentDefinition } from "mongoose"
import Invoice, { InvoiceDocument } from "../models/invoice.model"

import agenda from "./agendaInstance"
import logger from "../utils/logger"

const scheduler = {
    dueDateMail: async (invoice: DocumentDefinition<InvoiceDocument>, date: Date) => {
        logger.info(`setting up reminder mail on due date for ${invoice.id}`)

        await agenda.schedule(date, 'send-mail-on-due-date', { id: invoice._id })
    },

    reminderMails: async (invoiceId: string) => {
        logger.info(`setting up recurrent reminder mails for ${invoiceId}`)
        const invoice = await Invoice.findById(invoiceId)

        if (!invoice) return

        const interval = `${invoice.frequency} ${invoice.interval}`
        console.log("interval:", interval)
        await agenda.every('3 minutes', 'send-reminder-mails', { id: invoiceId })
    }
}

export default scheduler