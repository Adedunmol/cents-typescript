import express, { Request, Response } from 'express';
import helmet from 'helmet';
import rateLimiter from 'express-rate-limit';
import cors from 'cors';
import responseTime from 'response-time';
import cookieParser from 'cookie-parser';
import { verifyJWT } from './middlewares/verifyJWT';
import { connectDB } from './config/connect-db';
import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';
import invoiceRouter from './routes/invoice.route';
import clientRouter from './routes/client.route';
import { routeNotFound } from './middlewares/route-not-found';
import { errorHandler } from './middlewares/error-handler';
import emailJobEvents from './events/';
import { restResponseTimeHistogram } from './utils/metrics';
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { emailQueue, invoiceQueue } from './queue/producer';
import YAML from 'yamljs';
import swaggerUI from 'swagger-ui-express';
import path from 'path';

//@ts-ignore
import xss from 'xss-clean';

const app = express()


// emailJobEvents.on('send-reminder-mails', async (data: emailData) => {
//     await schedule.reminderMails(data.invoice._id)
// })


// emailJobEvents.on('dueMail', async (data: emailData) => {
//     console.log('due email has been emitted')
//     await schedule.dueDateMail(data.invoice._id, data.dueDate)
// })

export const serverAdapter = new ExpressAdapter()

const bullBoard = createBullBoard({
    queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(invoiceQueue)],
    serverAdapter
})

serverAdapter.setBasePath('/bull-board')

app.set('emailJobEvents', emailJobEvents)

app.use(cookieParser())
app.use(helmet())
app.use(cors())


connectDB(process.env.DATABASE_URI as string)

app.use(responseTime((req: Request, res: Response, time: number) => {
    if (req?.route?.path) {
        restResponseTimeHistogram.observe({
            method: req.method,
            route: req.route.path,
            status_code: res.statusCode
        }, time * 1000)
    }
}))
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(xss())

const docsPath = path.join(__dirname, '..', 'swagger.yaml')
const swaggerDocument = YAML.load(docsPath)

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

app.get('/', (req, res) => {
    const docs = req.protocol + '://' + req.get('host') + '/api-docs'
    return res.status(200).json({ status: 'success', message: '', data: { docs } })
})
app.use('/bull-board', serverAdapter.getRouter())
app.get('/', (req: Request, res: Response) => {
    return res.send('hello')
})

app.use('/api/v1/auth', authRouter)


app.use(verifyJWT)
app.use('/api/v1/users/', userRouter)
app.use('/api/v1/clients', clientRouter)
app.use('/api/v1/invoices', invoiceRouter)


app.use(routeNotFound)
app.use(errorHandler)

export default app;