import { ConnectionOptions } from 'bullmq'
import { Redis } from 'ioredis'

export const redisConnOptions: ConnectionOptions = { 
    host: 'localhost',// process.env.REDIS_HOST,
    port: 6379, // Number(process.env.REDIS_PORT),
    password: ''// process.env.REDIS_PASSWORD,
}

export const connection = process.env.ENVIRONMENT === 'production' ? new Redis(process.env.REDIS_URL!!, { maxRetriesPerRequest: null }) : redisConnOptions
