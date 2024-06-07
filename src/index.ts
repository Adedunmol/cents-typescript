require('express-async-errors')
require('dotenv').config()
import app from "./app";
import mongoose from "mongoose";
import { startMetricsServer } from "./utils/metrics";
import logger from "./utils/logger";

const PORT = process.env.PORT || 5000

mongoose.connection.once('open', () => {
    logger.info('Database Connected')
    app.listen(PORT, () => {
        logger.info(`App is listening on port ${PORT}...`)

        startMetricsServer()
    })
})