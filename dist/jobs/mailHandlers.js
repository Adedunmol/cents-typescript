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
exports.sendReminderMailsHandler = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const generateInvoice_1 = __importDefault(require("../utils/generateInvoice"));
const events_1 = __importDefault(require("../events"));
const agendaInstance_1 = __importDefault(require("./agendaInstance"));
const sendReminderMailsHandler = (invoiceId, recurrent) => __awaiter(void 0, void 0, void 0, function* () {
    const invoiceData = yield invoice_model_1.default.findOne({ _id: invoiceId }).exec();
    if (!invoiceData || invoiceData.fullyPaid) {
        if (!invoiceData)
            return;
        const job = yield agendaInstance_1.default.cancel({ 'data.body.id': invoiceData._id });
        console.log('cancelling job');
        return;
    }
    const user = yield user_model_1.default.findOne({ _id: invoiceData.createdBy }).exec();
    yield (0, generateInvoice_1.default)(invoiceData, path_1.default.join(__dirname, '..', 'invoices', `${invoiceData._id}.pdf`));
    //sending the invoice to the client here
    const subject = `${user === null || user === void 0 ? void 0 : user.fullName}'s invoice: Payment due today`;
    const text = `Please check the invoice below:`;
    // await sendMail(invoiceData.clientEmail, subject, text, 'invoice.hbs', invoiceData)
    //the invoice pdf is to be deleted from the invoices directory after sending to the client
    const filePath = path_1.default.join(__dirname, '..', 'invoices', `${invoiceData._id}.pdf`);
    fs_1.default.unlink(filePath, (err) => {
        if (err)
            throw err;
        console.log('file has been deleted');
    });
    if (recurrent)
        events_1.default.emit('send-reminder-mails', invoiceId);
});
exports.sendReminderMailsHandler = sendReminderMailsHandler;
