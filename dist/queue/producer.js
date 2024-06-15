"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToQueue = exports.invoiceQueue = exports.emailQueue = void 0;
require("./worker");
const bullmq_1 = require("bullmq");
const logger_1 = __importDefault(require("../utils/logger"));
const _1 = require(".");
exports.emailQueue = new bullmq_1.Queue('emails', { connection: _1.connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } } }); // : redisConnOptions,
exports.invoiceQueue = new bullmq_1.Queue('invoices', { connection: _1.connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } } }); // : redisConnOptions,
const sendToQueue = (queue, data) => __awaiter(void 0, void 0, void 0, function* () {
    switch (queue) {
        case 'emails':
            logger_1.default.info('mail added to queue');
            yield exports.emailQueue.add('send-mail', data, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
            break;
        case 'invoices':
            logger_1.default.info('invoice added to queue', data);
            yield exports.invoiceQueue.add('create-invoice', data, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
            break;
    }
});
exports.sendToQueue = sendToQueue;
