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
const bullmq_1 = require("bullmq");
const logger_1 = __importDefault(require("../utils/logger"));
const mail_1 = require("../utils/mail");
const generateInvoice_1 = __importDefault(require("../utils/generateInvoice"));
const fs_1 = __importDefault(require("fs"));
const _1 = require(".");
const emailWorker = new bullmq_1.Worker('emails', (job) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(job.data);
        const emailData = job.data;
        logger_1.default.info(`Sending mail to ${emailData.to}`);
        yield (0, mail_1.sendMailWithTemplates)(emailData.template, emailData.locals, emailData.to);
    }
    catch (err) {
        logger_1.default.error('error sending mail from worker', err);
    }
}), { connection: _1.redisConnOptions });
emailWorker.on('completed', job => {
    logger_1.default.info(`${job.id} has completed`);
});
emailWorker.on('failed', (job, err) => {
    logger_1.default.info(`${job.id} has failed due to ${err.message}`);
});
const invoiceWorker = new bullmq_1.Worker('invoices', (job) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(job.data);
        const invoiceData = job.data;
        yield (0, generateInvoice_1.default)(invoiceData.invoice, invoiceData.invoicePath);
        if (invoiceData.sendToEmail) {
            yield (0, mail_1.sendMailWithTemplates)("invoice", invoiceData.invoice, invoiceData.invoice.clientEmail, invoiceData.invoicePath, invoiceData.invoice._id);
        }
        fs_1.default.unlink(invoiceData.invoicePath, (err) => {
            if (err)
                throw new Error(err);
        });
    }
    catch (err) {
        logger_1.default.error('error generating invoice from worker', err);
    }
}), { connection: _1.redisConnOptions }); // , { connection: { host: 'localhost', port: 6379 } }
invoiceWorker.on('completed', job => {
    logger_1.default.info(`${job.id} has completed`);
});
invoiceWorker.on('failed', (job, err) => {
    logger_1.default.info(`${job.id} has failed due to ${err.message}`);
});
