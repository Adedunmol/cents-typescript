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
exports.sendMailWithTemplates = void 0;
const promises_1 = require("fs/promises");
const handlebars_1 = require("handlebars");
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("./logger"));
const email_templates_1 = __importDefault(require("email-templates"));
const OTP_EXPIRATION = 3600000;
const sendMailWithTemplates = (template, locals, to, invoicePath, invoiceId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('from send mail with templates: ', invoicePath);
        const email = new email_templates_1.default({
            message: {
                from: 'hi@example.com',
                attachments: invoicePath ? [{ path: invoicePath, contentType: 'application/pdf', filename: `${invoiceId}.pdf` }] : []
            },
            send: true,
            preview: false,
            transport: {
                host: 'sandbox.smtp.mailtrap.io',
                port: 2525,
                auth: {
                    user: process.env.MAILTRAP_USERNAME,
                    pass: process.env.MAILTRAP_PASSWORD //your Mailtrap password
                }
            },
        });
        const res = yield email.send({
            template: path_1.default.join(__dirname, '..', 'emails', template),
            message: { to },
            locals,
        });
        logger_1.default.info(`email sent to ${to}`);
    }
    catch (err) {
        logger_1.default.error("unable send mail");
        logger_1.default.error(err);
    }
});
exports.sendMailWithTemplates = sendMailWithTemplates;
const sendMail = (emailData) => __awaiter(void 0, void 0, void 0, function* () {
    const htmlFilePath = yield (0, promises_1.readFile)(path_1.default.join(__dirname, '..', 'public', 'html', emailData.html), 'utf-8');
    const template = (0, handlebars_1.compile)(htmlFilePath);
    const htmlToSend = template({ id: String(emailData.invoice._id).slice(0, 8), clientFullName: emailData.invoice.clientFullName });
    const transport = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    transport.verify((err, success) => {
        if (err) {
            logger_1.default.error("mail verification failed");
            throw new Error("Can't send mails");
        }
    });
    const mailOptions = {
        from: `Cents 📧 ${process.env.ADMIN}`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: htmlToSend,
        // html: html,
        attachments: emailData.invoice ? [{
                filename: `${String(emailData.invoice._id)}.pdf`,
                path: path_1.default.join(__dirname, '..', 'invoices', `${String(emailData.invoice._id)}.pdf`),
                contentType: 'application/pdf'
            }] : []
    };
    const result = yield transport.sendMail(mailOptions);
});
exports.default = sendMail;
