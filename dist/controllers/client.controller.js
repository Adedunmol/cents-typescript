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
exports.updateClientController = exports.deleteClientController = exports.createClientController = exports.getClientController = exports.getAllClientsController = void 0;
const client_service_1 = require("../service/client.service");
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("../errors");
const invoice_service_1 = require("../service/invoice.service");
const getAllClientsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const createdBy = req.user.id;
    const clients = yield (0, client_service_1.getAllClients)({ createdBy });
    return res.status(http_status_codes_1.StatusCodes.OK).json({ clients, nbHits: clients.length });
});
exports.getAllClientsController = getAllClientsController;
const getClientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const createdBy = req.user.id;
    const { id: clientID } = req.params;
    if (!clientID) {
        throw new errors_1.BadRequestError('no id with url');
    }
    const client = yield (0, client_service_1.getClient)({ _id: clientID, createdBy });
    if (!client)
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: 'Client not found' });
    return res.status(http_status_codes_1.StatusCodes.OK).json({ client });
});
exports.getClientController = getClientController;
const createClientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const createdBy = req.user.id;
    const clientObj = Object.assign(Object.assign({}, req.body), { createdBy });
    const result = yield (0, client_service_1.createClient)(clientObj);
    return res.status(http_status_codes_1.StatusCodes.CREATED).json({ client: result });
});
exports.createClientController = createClientController;
const deleteClientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const createdBy = req.user.id;
    const { id: clientID } = req.params;
    if (!clientID) {
        throw new errors_1.BadRequestError('No id with URL');
    }
    const foundClient = yield (0, client_service_1.getClient)({ _id: clientID });
    if (!foundClient) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: 'No client with this Id' });
    }
    const invoices = yield (0, client_service_1.deleteInvoices)({ $and: [{ createdBy }, { createdFor: clientID }] });
    const client = yield (0, client_service_1.deleteClient)({ $and: [{ createdBy }, { _id: clientID }] });
    return res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Client has been deleted' });
});
exports.deleteClientController = deleteClientController;
const updateClientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const createdBy = req.user.id;
    const { id: clientID } = req.params;
    if (!clientID) {
        throw new errors_1.BadRequestError('No id with URL');
    }
    const client = yield (0, client_service_1.getClient)({ createdBy, _id: clientID });
    if (!client) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: 'No client with this Id' });
    }
    const invoices = yield (0, invoice_service_1.updateInvoices)({ createdFor: clientID, createdBy }, Object.assign({ clientFullName: req.body.fullName }, req.body));
    const updatedClient = yield (0, client_service_1.updateClient)({ createdBy, _id: clientID }, Object.assign({ clientFullName: req.body.fullName }, req.body));
    return res.status(http_status_codes_1.StatusCodes.OK).json({ client: updatedClient });
});
exports.updateClientController = updateClientController;
