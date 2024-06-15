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
require('express-async-errors');
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ClientService = __importStar(require("../service/client.service"));
const InvoiceService = __importStar(require("../service/invoice.service"));
const app_1 = __importDefault(require("../app"));
const userId = new mongoose_1.default.Types.ObjectId().toString();
const clientId = new mongoose_1.default.Types.ObjectId().toString();
const invoicePayload = {
    clientFullName: 'mr client',
    clientEmail: 'nobody@test.com',
    clientPhoneNumber: '0701234567',
    services: [],
    total: 100,
    dueDate: Date.now(),
    fullyPaid: false,
    createdBy: new mongoose_1.default.Types.ObjectId().toString(),
    createdFor: new mongoose_1.default.Types.ObjectId().toString(),
    createdAt: Date.now(),
    updatedAt: Date.now()
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
describe('client', () => {
    describe('get all clients route', () => {
        describe('given the user is logged in', () => {
            it('should return a list of users', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(ClientService, 'getAllClients')
                    // @ts-ignore
                    .mockReturnValue([clientPayload]);
                const roles = Object.values(userPayload.roles);
                const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                // @ts-ignore
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).get('/api/v1/clients/').set('Authorization', `Bearer ${token}`);
                expect(statusCode).toBe(200);
            }));
        });
    });
    describe('get client route', () => {
        describe('given the user id', () => {
            it('should return a user', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(ClientService, 'getClient')
                    // @ts-ignore
                    .mockReturnValue(clientPayload);
                const roles = Object.values(userPayload.roles);
                const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                // @ts-ignore
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).get(`/api/v1/clients/${userId}`).set('Authorization', `Bearer ${token}`);
                expect(statusCode).toBe(200);
            }));
        });
    });
    describe('test create client route', () => {
        describe('given valid data for a client', () => {
            it('should return a 201', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(ClientService, 'createClient')
                    // @ts-ignore
                    .mockReturnValue(clientPayload);
                const roles = Object.values(userPayload.roles);
                const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                // @ts-ignore
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).post(`/api/v1/clients/`).send(clientPayload).set('Authorization', `Bearer ${token}`);
                expect(statusCode).toBe(201);
            }));
        });
        describe('given invalid data for a client', () => {
            it('should return a 400', () => __awaiter(void 0, void 0, void 0, function* () {
                const clientPayload = {
                    _id: clientId,
                    fullName: 'mr client',
                    createdBy: userId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                jest.spyOn(ClientService, 'createClient')
                    // @ts-ignore
                    .mockReturnValue(clientPayload);
                const roles = Object.values(userPayload.roles);
                const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                // @ts-ignore
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).post(`/api/v1/clients/`).send(clientPayload).set('Authorization', `Bearer ${token}`);
                expect(statusCode).toBe(400);
            }));
        });
    });
    describe('delete client route', () => {
        describe('given a client id is provided and client is in db', () => {
            it('should return a 200', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(ClientService, 'getClient')
                    // @ts-ignore
                    .mockReturnValue(clientPayload);
                jest.spyOn(ClientService, 'deleteInvoices')
                    // @ts-ignore
                    .mockReturnValue(invoicePayload);
                jest.spyOn(ClientService, 'deleteClient')
                    // @ts-ignore
                    .mockReturnValue(clientPayload);
                const roles = Object.values(userPayload.roles);
                const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).delete(`/api/v1/clients/${userId}`).set('Authorization', `Bearer ${token}`);
                expect(statusCode).toBe(200);
            }));
        });
        describe('given a client id is provided and client is not in db', () => {
            it('should return a 404', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(ClientService, 'getClient')
                    // @ts-ignore
                    .mockReturnValue(false);
                const roles = Object.values(userPayload.roles);
                const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).delete(`/api/v1/clients/${userId}`).set('Authorization', `Bearer ${token}`);
                expect(statusCode).toBe(404);
            }));
        });
    });
    describe('update client route', () => {
        describe('given the client id is provided and client is in db', () => {
            it('should return a 200', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(ClientService, 'getClient')
                    // @ts-ignore
                    .mockReturnValue(clientPayload);
                jest.spyOn(InvoiceService, 'updateInvoices')
                    // @ts-ignore
                    .mockReturnValue(invoicePayload);
                jest.spyOn(ClientService, 'updateClient')
                    // @ts-ignore
                    .mockReturnValue(clientPayload);
                const roles = Object.values(userPayload.roles);
                const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).patch(`/api/v1/clients/${userId}`).send(clientPayload).set('Authorization', `Bearer ${token}`);
                expect(statusCode).toBe(200);
            }));
        });
    });
});
