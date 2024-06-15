"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('express-async-errors');
require('dotenv').config();
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const metrics_1 = require("./utils/metrics");
const logger_1 = __importDefault(require("./utils/logger"));
const PORT = process.env.PORT || 5000;
mongoose_1.default.connection.once('open', () => {
    logger_1.default.info('Database Connected');
    app_1.default.listen(PORT, () => {
        logger_1.default.info(`App is listening on port ${PORT}...`);
        (0, metrics_1.startMetricsServer)();
    });
});
