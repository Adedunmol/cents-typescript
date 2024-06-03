import Agenda from "agenda"
import jobHandlers from "./handlers"

const mailDefinition = async (agenda: Agenda) => {
    agenda.define('send-mail-on-due-date', jobHandlers.sendMailOnDueDate)
    agenda.define('send-reminder-mails', jobHandlers.sendReminderMails)
}

const definitions = [mailDefinition]

const allDefinitions = (agenda: Agenda) => {
    definitions.forEach((definition) => definition(agenda))
}

export default allDefinitions;