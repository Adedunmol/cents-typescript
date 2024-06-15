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
exports.sendInvoiceToClientController = exports.updateInvoiceController = exports.getAllInvoicesController = exports.getClientInvoicesController = exports.getInvoiceController = exports.createInvoiceController = void 0;
const client_service_1 = require("../service/client.service");
const invoice_service_1 = require("../service/invoice.service");
const errors_1 = require("../errors");
const http_status_codes_1 = require("http-status-codes");
const path_1 = __importDefault(require("path"));
const auth_service_1 = require("../service/auth.service");
const date_fns_1 = require("date-fns");
const producer_1 = require("../queue/producer");
const scheduler_1 = __importDefault(require("../jobs/scheduler"));
const logger_1 = __importDefault(require("../utils/logger"));
const splitDate = (dateStr) => {
    const pattern = /(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/gm;
    const dates = dateStr.split(pattern);
    if (dates.length < 5)
        return null;
    return { year: dates[1], month: dates[2], day: dates[3] };
};
const createInvoiceController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const emailJobEvents = req.app.get('emailJobEvents')
    const createdBy = req.user.id;
    let { services, dueDate, clientId } = req.body;
    const splittedDate = splitDate(dueDate);
    if (!splittedDate) {
        logger_1.default.info('early return due to invalid date');
        throw new errors_1.BadRequestError('invalid date structure');
    }
    const formattedDueDate = new Date(Number(splittedDate.year), Number(splittedDate.month) - 1, Number(splittedDate.day), 19, 40);
    if (isNaN(formattedDueDate.getTime()))
        throw new errors_1.BadRequestError('Date is not valid');
    // first date (due date) has to be greater than or equal to the current date
    if ((0, date_fns_1.isBefore)(formattedDueDate, new Date()))
        throw new errors_1.BadRequestError('The due date can\'t be before the current date, try a future date.');
    if (!clientId) {
        throw new errors_1.BadRequestError('ClientId is not included with url');
    }
    const client = yield (0, client_service_1.getClient)({ _id: clientId });
    if (!client) {
        throw new errors_1.BadRequestError('No client with this id');
    }
    const total = services.reduce((current, obj) => current + Math.floor(obj.rate * obj.hours), 0);
    dueDate = new Date(dueDate).toISOString();
    const invoiceObj = Object.assign(Object.assign({}, req.body), { createdBy, createdFor: clientId, total, clientFullName: client.fullName, clientEmail: client.email, clientPhoneNumber: client.phoneNumber });
    const invoice = yield (0, invoice_service_1.createInvoice)(invoiceObj);
    //mailScheduleOnDueDate(invoice, dueDate)
    yield scheduler_1.default.dueDateMail(invoice, formattedDueDate);
    // emailJobEvents.emit('dueMail', { invoice, dueDate })
    // sendToQueue("invoices", invoice)
    return res.status(http_status_codes_1.StatusCodes.CREATED).json({ invoice });
});
exports.createInvoiceController = createInvoiceController;
const getInvoiceController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: clientId, invoiceId } = req.params;
    const createdBy = req.user.id;
    if (!clientId) {
        throw new errors_1.BadRequestError('ClientId is not included with url');
    }
    const client = yield (0, client_service_1.getClient)({ _id: clientId });
    if (!client) {
        throw new errors_1.NotFoundError('No client with this id');
    }
    const invoice = yield (0, invoice_service_1.findInvoice)({ _id: invoiceId, createdFor: client._id, createdBy });
    if (!invoice) {
        throw new errors_1.NotFoundError('No invoice found with this id');
    }
    return res.status(http_status_codes_1.StatusCodes.OK).json({ invoice });
});
exports.getInvoiceController = getInvoiceController;
const getClientInvoicesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clientId } = req.params;
    const createdBy = req.user.id;
    if (!clientId) {
        throw new errors_1.BadRequestError('ClientId is not included with url');
    }
    const client = yield (0, client_service_1.getClient)({ _id: clientId });
    if (!client) {
        throw new errors_1.NotFoundError('No client with this id');
    }
    const invoices = yield (0, invoice_service_1.getInvoices)({ createdFor: client._id, createdBy });
    return res.status(http_status_codes_1.StatusCodes.OK).json({ invoices, nbHits: invoices.length });
});
exports.getClientInvoicesController = getClientInvoicesController;
const getAllInvoicesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const createdBy = req.user.id;
    const invoices = yield (0, invoice_service_1.getInvoices)({ createdBy });
    if (!invoices)
        return res.status(http_status_codes_1.StatusCodes.OK).send({ invoices: [], nbHits: 0 });
    return res.status(http_status_codes_1.StatusCodes.OK).json({ invoices, nbHits: invoices.length });
});
exports.getAllInvoicesController = getAllInvoicesController;
const updateInvoiceController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: clientId, invoiceId } = req.params;
    const createdBy = req.user.id;
    const { services, fullyPaid, dueDate } = req.body;
    if (!clientId) {
        throw new errors_1.BadRequestError('ClientId is not included with url');
    }
    const client = yield (0, client_service_1.getClient)({ _id: clientId });
    if (!client) {
        throw new errors_1.NotFoundError('No client with this id');
    }
    const invoice = yield (0, invoice_service_1.findAndUpdateInvoice)({ _id: invoiceId, createdFor: client._id, createdBy }, req.body);
    if (!invoice) {
        throw new errors_1.NotFoundError('No invoice found with this id');
    }
    // const result = await invoice.save()
    return res.status(http_status_codes_1.StatusCodes.OK).json({ invoice });
});
exports.updateInvoiceController = updateInvoiceController;
const sendInvoiceToClientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: invoiceId } = req.params;
    if (!invoiceId) {
        throw new errors_1.BadRequestError('No invoice id with url');
    }
    const invoice = yield (0, invoice_service_1.findInvoice)({ _id: invoiceId });
    if (!invoice)
        throw new errors_1.NotFoundError('no invoice with this id found');
    if (!invoice) {
        throw new errors_1.NotFoundError('No invoice with this id');
    }
    const user = yield (0, auth_service_1.findUserById)(String(invoice.createdBy));
    if (!user)
        throw new errors_1.NotFoundError('no user found with this id');
    const invoiceData = {
        sendToEmail: true,
        invoice,
        invoicePath: path_1.default.join(__dirname, '..', 'invoices', `${invoice._id}.pdf`)
    };
    yield (0, producer_1.sendToQueue)('invoices', invoiceData);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'The Invoice has been sent to the client' });
});
exports.sendInvoiceToClientController = sendInvoiceToClientController;
