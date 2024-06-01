import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint()
        // winston.format.printf(info => `${info.timestamp} ${info.level} ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "app.log", level: "error" })
    ]
})

// const childLogger = wLogger.child()

export default logger;