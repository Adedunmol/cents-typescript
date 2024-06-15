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
Object.defineProperty(exports, "__esModule", { value: true });
const mailHandlers_1 = require("./mailHandlers");
const jobHandlers = {
    sendMailOnDueDate: (job) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`Running at: ${Date()}`);
        const invoiceId = job.attrs.data.id;
        yield (0, mailHandlers_1.sendReminderMailsHandler)(invoiceId, false);
        console.log('job done');
    }),
    sendReminderMails: (job) => __awaiter(void 0, void 0, void 0, function* () {
        const invoiceId = job.attrs.data.id;
        console.log(`Reminder mails: ${invoiceId}`);
        yield (0, mailHandlers_1.sendReminderMailsHandler)(invoiceId, true);
        console.log('reminder mails done');
    })
};
exports.default = jobHandlers;
