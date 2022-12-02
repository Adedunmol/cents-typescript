import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/connect-db';
import authRouter from './routes/auth.route';
import { routeNotFound } from './middlewares/route-not-found';
import { errorHandler } from './middlewares/error-handler';

const app = express()

connectDB(process.env.DATABASE_URI as string)

app.use(express.json())
app.use(cookieParser())

app.get('/', (req: Request, res: Response) => {
    return res.send('hello')
})

app.use('/api/v1/auth', authRouter)

app.use(routeNotFound)
app.use(errorHandler)

export default app;