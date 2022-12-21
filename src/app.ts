import express, { Request, Response } from 'express';
import helmet from 'helmet';
import rateLimiter from 'express-rate-limit';
import cors from 'cors';
import { sendMailOnDueDate, sendMailsAfterDueDate } from './jobs';
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
import { emailData } from './utils/interfaces';

const app = express()


emailJobEvents.on('send-reminder-mails', async (data: emailData) => {
    await sendMailsAfterDueDate(data.invoice)
})


emailJobEvents.on('dueMail', async (data: emailData) => {
    await sendMailOnDueDate(data.invoice)
})


app.set('emailJobEvents', emailJobEvents)

app.use(cookieParser())
app.use(helmet())
app.use(cors())


connectDB(process.env.DATABASE_URI as string)

app.use(express.json())
app.use(cookieParser())

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