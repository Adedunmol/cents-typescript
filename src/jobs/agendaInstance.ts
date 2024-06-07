import Agenda from 'agenda'
import allDefinitions from './definitions'
import logger from '../utils/logger'

const agenda = new Agenda({
    name: 'mail queue',
    db: {
        address: process.env.DATABASE_URI as string,
        collection: 'agendaJobs',
    },
    maxConcurrency: 20,
    processEvery: '1 minute'
})

//check if agenda has started
agenda
.on('ready', async () => { 
    await agenda.start()
    logger.info('Agenda has started')
})
.on('error', (err) => logger.error('Agenda has not started', err))


//need to create the definitions(jobs) before
allDefinitions(agenda)

export default agenda;