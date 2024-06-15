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
exports.updateClient = exports.deleteClient = exports.deleteInvoices = exports.createClient = exports.getClient = exports.getAllClients = void 0;
const client_model_1 = __importDefault(require("../models/client.model"));
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const metrics_1 = require("../utils/metrics");
const getAllClients = (query) => __awaiter(void 0, void 0, void 0, function* () {
    return yield client_model_1.default.find(query).sort('createdAt');
});
exports.getAllClients = getAllClients;
const getClient = (query) => __awaiter(void 0, void 0, void 0, function* () {
    return yield client_model_1.default.findOne(query).exec();
});
exports.getClient = getClient;
const createClient = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const metricsLabels = {
        operation: 'createClient'
    };
    const timer = metrics_1.databaseResponseTimeHistogram.startTimer();
    try {
        const result = yield client_model_1.default.create(input);
        timer(Object.assign(Object.assign({}, metricsLabels), { success: 'true' }));
        return result;
    }
    catch (err) {
        timer(Object.assign(Object.assign({}, metricsLabels), { success: 'false' }));
        throw new Error(err);
    }
});
exports.createClient = createClient;
const deleteInvoices = (query) => __awaiter(void 0, void 0, void 0, function* () {
    return yield invoice_model_1.default.deleteMany(query);
});
exports.deleteInvoices = deleteInvoices;
const deleteClient = (query) => __awaiter(void 0, void 0, void 0, function* () {
    return yield client_model_1.default.findOneAndDelete(query);
});
exports.deleteClient = deleteClient;
const updateClient = (query, update) => __awaiter(void 0, void 0, void 0, function* () {
    return yield client_model_1.default.findOneAndUpdate(query, update, { new: true, runValidators: true });
});
exports.updateClient = updateClient;
