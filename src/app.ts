import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/connect-db';
import authRouter from './routes/auth.route';

const app = express()

connectDB(process.env.DATABASE_URI as string)

app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/auth', authRouter)

export default app;