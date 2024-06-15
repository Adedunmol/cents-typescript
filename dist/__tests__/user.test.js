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
const app_1 = __importDefault(require("../app"));
const UserService = __importStar(require("../service/user.service"));
const userId = new mongoose_1.default.Types.ObjectId().toString();
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
describe('user', () => {
    describe('update user route', () => {
        describe('given the user is logged in', () => {
            it('should send a 200', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(UserService, 'findUserAndUpdate')
                    // @ts-ignore
                    .mockReturnValue(userPayload);
                const roles = Object.values(userPayload.roles);
                const token = jsonwebtoken_1.default.sign({ UserInfo: Object.assign(Object.assign({}, userPayload), { roles }) }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                // @ts-ignore
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).patch('/api/v1/users/update').send(userPayload).set('Authorization', `Bearer ${token}`);
                expect(statusCode).toBe(200);
            }));
        });
        describe('given the user is not logged in', () => {
            it('should throw unauthorized error', () => __awaiter(void 0, void 0, void 0, function* () {
                const UserServiceMock = jest.spyOn(UserService, 'findUserAndUpdate');
                try {
                    // @ts-ignore
                    yield (0, supertest_1.default)(app_1.default).patch('/api/v1/users/update').send(userPayload);
                    expect(UserServiceMock).not.toHaveBeenCalled();
                }
                catch (err) {
                }
            }));
        });
    });
});
