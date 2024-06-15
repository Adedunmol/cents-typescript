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
exports.findAndUpdateInvoice = exports.updateInvoices = exports.getInvoices = exports.findInvoice = exports.createInvoice = void 0;
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const createInvoice = (input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield invoice_model_1.default.create(input);
    }
    catch (err) {
        throw new Error(err);
    }
});
exports.createInvoice = createInvoice;
const findInvoice = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield invoice_model_1.default.findOne(query);
    }
    catch (err) {
    }
});
exports.findInvoice = findInvoice;
const getInvoices = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield invoice_model_1.default.find(query);
    }
    catch (err) {
        throw new Error(err);
    }
});
exports.getInvoices = getInvoices;
const updateInvoices = (query, update) => __awaiter(void 0, void 0, void 0, function* () {
    return yield invoice_model_1.default.updateMany(query, update);
});
exports.updateInvoices = updateInvoices;
const findAndUpdateInvoice = (query, update) => __awaiter(void 0, void 0, void 0, function* () {
    return yield invoice_model_1.default.findOneAndUpdate(query, update, { new: true, runValidators: true });
});
exports.findAndUpdateInvoice = findAndUpdateInvoice;
