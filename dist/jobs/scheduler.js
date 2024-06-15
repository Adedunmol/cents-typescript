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
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const agendaInstance_1 = __importDefault(require("./agendaInstance"));
const scheduler = {
    dueDateMail: (invoice, date) => __awaiter(void 0, void 0, void 0, function* () {
        yield agendaInstance_1.default.schedule(date, 'send-mail-on-due-date', { id: invoice._id });
    }),
    reminderMails: (invoiceId) => __awaiter(void 0, void 0, void 0, function* () {
        const invoice = yield invoice_model_1.default.findById(invoiceId);
        if (!invoice)
            return;
        yield agendaInstance_1.default.every(`${invoice.frequency} ${invoice.interval}`, 'send-reminder-mails', { id: invoiceId });
    })
};
exports.default = scheduler;
