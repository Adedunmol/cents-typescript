import { ConnectionOptions } from 'bullmq'

export const redisConnOptions: ConnectionOptions = { 
    host: 'localhost',// process.env.REDIS_HOST,
    port: 6379, // Number(process.env.REDIS_PORT),
    password: ''// process.env.REDIS_PASSWORD,
}