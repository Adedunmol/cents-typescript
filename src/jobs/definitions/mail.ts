import jobHandlers from '../handlers'

const mailDefinition = async (agenda: any) => {
    agenda.define('send-mail-on-due-date', jobHandlers.sendMailOnDueDate)
    agenda.define('send-reminder-mails', jobHandlers.sendReminderMails)
}

export default mailDefinition;