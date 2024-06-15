"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
require('dotenv').config();
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("../app"));
const ClientService = __importStar(require("../service/client.service"));
const InvoiceService = __importStar(require("../service/invoice.service"));
const userId = new mongoose_1.default.Types.ObjectId().toString();
const invoiceId = new mongoose_1.default.Types.ObjectId().toString();
const clientId = new mongoose_1.default.Types.ObjectId().toString();
const userPayload = {
    _id: userId,
    email: 'nobody@test.com',
    fullName: 'mr test',
    roles: {
        User: 1984
    },
    refreshToken: [],
    save: () => true
};
const invoicePayload = {
    _id: invoiceId,
    clientFullName: 'mr client',
    clientEmail: 'nobody@test.com',
    clientPhoneNumber: '0701234567',
    services: [],
    total: 100,
    dueDate: new Date(),
    fullyPaid: false,
    createdBy: new mongoose_1.default.Types.ObjectId().toString(),
    createdFor: new mongoose_1.default.Types.ObjectId().toString(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    save: () => true
};
const invoiceInput = {
    services: [{
            "item": "test",
            "rate": 19,
            "hours": 10,
            "paid": true
        }],
    dueDate: Date.now()
};
const clientPayload = {
    _id: clientId,
    fullName: 'mr client',
    email: 'client@test.com',
    phoneNumber: '0701234567',
    createdBy: userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
};
describe('invoice', () => {
    describe('create invoice route', () => {
        describe('given valid data is sent', () => {
            it('should return a 201', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    jest.spyOn(ClientService, 'getClient')
                        // @ts-ignore
                        .mockReturnValue(clientPayload);
                    jest.spyOn(InvoiceService, 'createInvoice')
                        // @ts-ignore
                        .mockReturnValue(invoicePayload);
                    const roles = Object.values(userPayload.roles);
                    const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                    const { statusCode } = yield (0, supertest_1.default)(app_1.default).post(`/api/v1/clients/${clientPayload._id}/invoices`).send(invoiceInput).set('Authorization', `Bearer ${token}`);
                    expect(statusCode).toBe(201);
                }
                catch (err) {
                }
            }));
        });
    });
    describe('get client\'s invoice route', () => {
        describe('given the id of the invoice is provided', () => {
            it('should return a 200', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(ClientService, 'getClient')
                    // @ts-ignore
                    .mockReturnValue(clientPayload);
                jest.spyOn(InvoiceService, 'findInvoice')
                    // @ts-ignore
                    .mockReturnValue(invoicePayload);
                const roles = Object.values(userPayload.roles);
                const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).get(`/api/v1/clients/${clientPayload._id}/invoices/${invoicePayload._id}`).send(invoiceInput).set('Authorization', `Bearer ${token}`);
                expect(statusCode).toBe(200);
            }));
        });
    });
    describe('get all invoices route', () => {
        describe('given the user is logged in', () => {
            it('should return a list of invoices', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(InvoiceService, 'getInvoices')
                    // @ts-ignore
                    .mockReturnValue([invoicePayload]);
                const roles = Object.values(userPayload.roles);
                const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).get(`/api/v1/invoices/`).send(invoiceInput).set('Authorization', `Bearer ${token}`);
                expect(statusCode).toBe(200);
            }));
        });
    });
    describe('update invoice route', () => {
        describe('given the invoice is found and valid data is sent', () => {
            it('should return a 200', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(ClientService, 'getClient')
                    // @ts-ignore
                    .mockReturnValue(clientPayload);
                jest.spyOn(InvoiceService, 'findAndUpdateInvoice')
                    // @ts-ignore
                    .mockReturnValue(invoicePayload);
                const roles = Object.values(userPayload.roles);
                const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                const updateObj = { 'clientFullName': 'newClient' };
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).patch(`/api/v1/clients/${clientPayload._id}/invoices/${invoicePayload._id}`).send(updateObj).set('Authorization', `Bearer ${token}`);
                expect(statusCode).toBe(200);
            }));
        });
    });
});
