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
const AuthService = __importStar(require("../service/auth.service"));
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("../app"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_controller_1 = require("../controllers/auth.controller");
const errors_1 = require("../errors");
const queue = __importStar(require("../queue/producer"));
const user_otp_verification_model_1 = __importDefault(require("../models/user-otp-verification.model"));
const bcrypt_1 = __importStar(require("bcrypt"));
const bcryptMock = { compare: bcrypt_1.compare };
const userId = new mongoose_1.default.Types.ObjectId().toString();
const userInput = {
    username: 'test',
    email: 'nobody@test.com',
    fullName: 'mr test',
    password: 'Password123',
    passwordConfirmation: 'Password123',
    roles: {
        User: 1984
    }
};
const userPayload = Object.assign(Object.assign({}, userInput), { refreshToken: [], save: () => true });
const otp = {
    userId,
    otp: 'hashedotp',
    expiresAt: Date.now() + 100000
};
describe('auth', () => {
    describe('register user route', () => {
        describe('given the user does not exist', () => {
            it('should create a new user and return the user payload', () => __awaiter(void 0, void 0, void 0, function* () {
                const createUserServiceMock = jest
                    .spyOn(AuthService, 'createUser')
                    // @ts-ignore
                    .mockReturnValueOnce(userPayload);
                const sendToQueueMock = jest
                    .spyOn(queue, 'sendToQueue')
                    .mockResolvedValue();
                const userOTPMock = jest
                    .spyOn(user_otp_verification_model_1.default, 'create')
                    .mockReturnValueOnce();
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(userInput);
                expect(statusCode).toBe(201);
                //expect(body.user).toEqual(userPayload)
                expect(createUserServiceMock).toHaveBeenCalledWith(userInput);
            }));
        });
        describe('given the passwords do not match', () => {
            it('should return a 400', () => __awaiter(void 0, void 0, void 0, function* () {
                const createUserServiceMock = jest
                    .spyOn(AuthService, 'createUser')
                    // @ts-ignore
                    .mockReturnValueOnce(userPayload);
                const sendToQueueMock = jest
                    .spyOn(queue, 'sendToQueue')
                    .mockResolvedValue();
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(Object.assign(Object.assign({}, userInput), { passwordConfirmation: 'does not match' }));
                expect(statusCode).toBe(400);
                expect(createUserServiceMock).not.toHaveBeenCalled();
            }));
        });
        describe('given the user exists', () => {
            it('should return 409', () => __awaiter(void 0, void 0, void 0, function* () {
                const createUserServiceMock = jest
                    .spyOn(AuthService, 'createUser')
                    .mockRejectedValue('user exists');
                const sendToQueueMock = jest
                    .spyOn(queue, 'sendToQueue')
                    .mockResolvedValue();
                const { statusCode } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(userInput);
                expect(statusCode).toBe(409);
                expect(createUserServiceMock).toHaveBeenCalled();
            }));
        });
    });
    describe('login user route', () => {
        describe('given valid details', () => {
            it('should send a 200', () => __awaiter(void 0, void 0, void 0, function* () {
                jest
                    .spyOn(AuthService, 'findUserByEmail')
                    // @ts-ignore
                    .mockReturnValue(userPayload);
                jest
                    .spyOn(AuthService, 'validatePassword')
                    // @ts-ignore
                    .mockReturnValue(userPayload);
                const json = jest.fn();
                const cookie = jest.fn();
                const status = jest.fn(code => ({
                    json: jest.fn()
                }));
                const req = {
                    body: Object.assign({}, userInput)
                };
                const res = {
                    json,
                    cookie,
                    status
                };
                // @ts-ignore
                const result = yield (0, auth_controller_1.loginController)(req, res);
                expect(status).toHaveBeenCalledWith(200);
            }));
        });
        describe('given invalid details', () => {
            it('should send a 401', () => __awaiter(void 0, void 0, void 0, function* () {
                jest
                    .spyOn(AuthService, 'findUserByEmail')
                    // @ts-ignore
                    .mockReturnValue(userPayload);
                jest
                    .spyOn(AuthService, 'validatePassword')
                    // @ts-ignore
                    .mockReturnValue(false);
                const json = jest.fn();
                const cookie = jest.fn();
                const status = jest.fn();
                const req = {
                    body: Object.assign({}, userInput)
                };
                const res = {
                    json,
                    cookie,
                    status
                };
                // @ts-ignore
                //const error = await loginController(req, res)
                yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
                    // @ts-ignore
                    yield (0, auth_controller_1.loginController)(req, res);
                })).rejects.toBeInstanceOf(errors_1.UnauthorizedError);
            }));
        });
    });
    describe('logout user route', () => {
        describe('given the user is logged in', () => {
            it('should return 204', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(AuthService, 'findUserWithToken')
                    // @ts-ignore
                    .mockReturnValue(userPayload);
                const cookies = jest.fn().mockReturnValue('testingcookie');
                const clearCookie = jest.fn();
                const sendStatus = jest.fn();
                const req = {
                    cookies
                };
                const res = {
                    clearCookie,
                    sendStatus
                };
                // @ts-ignore
                const result = yield (0, auth_controller_1.logoutController)(req, res);
                expect(sendStatus).toHaveBeenCalled();
            }));
        });
    });
    describe('refresh-token route', () => {
        describe('given the user has cookies', () => {
            it('should return new access token', () => __awaiter(void 0, void 0, void 0, function* () {
                const refreshToken = jsonwebtoken_1.default.sign({ email: userPayload.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
                jest.spyOn(AuthService, 'findUserWithToken')
                    // @ts-ignore
                    .mockReturnValue(userPayload);
                const clearCookie = jest.fn();
                const cookie = jest.fn();
                const status = jest.fn(() => {
                    return {
                        json: jest.fn()
                    };
                });
                const sendStatus = jest.fn();
                const req = {
                    cookies: {
                        jwt: refreshToken
                    }
                };
                const res = {
                    clearCookie,
                    status,
                    cookie,
                    sendStatus
                };
                // @ts-ignore
                const result = yield (0, auth_controller_1.refreshTokenController)(req, res);
                expect(status).toHaveBeenCalledWith(200);
            }));
        });
        describe('given the user does not have a cookie', () => {
            it('should throw an unauthorized error', () => {
                const clearCookie = jest.fn();
                const cookie = jest.fn();
                const status = jest.fn(() => {
                    return {
                        json: jest.fn()
                    };
                });
                const sendStatus = jest.fn();
                const req = {};
                const res = {
                    clearCookie,
                    status,
                    cookie,
                    sendStatus
                };
                // @ts-ignore
                expect(() => (0, auth_controller_1.refreshTokenController)(req, res)).rejects.toThrow();
            });
        });
    });
    describe('verify-otp route', () => {
        describe('given no otp found for user', () => {
            it('should throw a bad request error', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = { userId, otp: "1235" };
                jest
                    .spyOn(AuthService, 'findUserWithOtp')
                    .mockResolvedValue([]);
                jest
                    .spyOn(AuthService, 'deleteUserOtp')
                    .mockResolvedValue({});
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/verify-otp').send(data);
                expect(statusCode).toBe(400);
            }));
        });
        describe('given no user details sent', () => {
            it('should throw a bad request error', () => __awaiter(void 0, void 0, void 0, function* () {
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/verify-otp');
                expect(statusCode).toBe(400);
            }));
        });
        describe('given the otp has expired', () => {
            it('should throw a bad request error', () => __awaiter(void 0, void 0, void 0, function* () {
                jest
                    .spyOn(AuthService, 'findUserWithOtp')
                    // @ts-ignore
                    .mockResolvedValue([{ expiresAt: Date.now() - 10, otp: "hashedOtp" }]);
                jest
                    .spyOn(AuthService, 'deleteUserOtp')
                    .mockResolvedValue({});
                const data = { userId, otp: "1235" };
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/verify-otp').send(data);
                expect(statusCode).toBe(400);
            }));
        });
        describe('given the otp is not valid', () => {
            it('should throw a bad request error', () => __awaiter(void 0, void 0, void 0, function* () {
                jest
                    .spyOn(AuthService, 'findUserWithOtp')
                    // @ts-ignore
                    .mockResolvedValue([{ expiresAt: Date.now() + 1000, otp: 'hashedOtp' }]);
                jest
                    .spyOn(bcryptMock, 'compare')
                    .mockImplementation((plain, hash) => Promise.resolve(false));
                const data = { userId, otp: "1235" };
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/verify-otp').send(data);
                expect(statusCode).toBe(400);
            }));
        });
        describe('given the otp is valid', () => {
            it('should return a success', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.clearAllMocks();
                const payload = Object.assign(Object.assign({ userId }, userInput), { otp: '1234' });
                const userOTPVerification = {
                    userId,
                    expiresAt: Date.now() + 100000,
                    otp: bcrypt_1.default.hashSync(payload.otp, 10)
                };
                jest
                    .spyOn(AuthService, 'findUserWithOtp')
                    .mockResolvedValue([userOTPVerification]);
                jest
                    .spyOn(bcryptMock, 'compare')
                    .mockImplementation((plain, hash) => Promise.resolve(true));
                jest
                    .spyOn(AuthService, 'updateUserVerification')
                    .mockResolvedValue(userPayload);
                jest
                    .spyOn(AuthService, 'deleteUserOtp')
                    .mockResolvedValue({});
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v2/auth/verify-otp').send(payload);
                expect(statusCode).toBe(200);
            }));
        });
    });
    describe('resend otp route', () => {
        describe('given user details not sent', () => {
            it('should throw a bad request error', () => __awaiter(void 0, void 0, void 0, function* () {
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/resend-otp');
                expect(statusCode).toBe(400);
            }));
        });
        describe('given user details', () => {
            it('should return a success', () => __awaiter(void 0, void 0, void 0, function* () {
                jest
                    .spyOn(AuthService, 'generateOtp')
                    .mockResolvedValue('1234');
                jest
                    .spyOn(AuthService, 'deleteUserOtp')
                    .mockResolvedValue({});
                const sendToQueueMock = jest
                    .spyOn(queue, 'sendToQueue')
                    .mockResolvedValue();
                const payload = Object.assign({ userId }, userInput);
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/resend-otp').send(payload);
                expect(statusCode).toBe(200);
            }));
        });
    });
    describe('forgot password route', () => {
        describe('given no user exists with the email given', () => {
            it('should throw a bad request error', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(AuthService, 'findUserByEmail')
                    // @ts-ignore
                    .mockReturnValue(null);
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/forgot-password').send(userInput);
                expect(statusCode).toBe(400);
            }));
        });
        describe('given empty payload sent', () => {
            it('should return a 400', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(AuthService, 'findUserByEmail')
                    // @ts-ignore
                    .mockReturnValue(null);
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/forgot-password').send({});
                expect(statusCode).toBe(400);
            }));
        });
        describe('given user not verified', () => {
            it('should return a 400', () => __awaiter(void 0, void 0, void 0, function* () {
                const payload = Object.assign(Object.assign({}, userPayload), { verified: false });
                jest.spyOn(AuthService, 'findUserByEmail')
                    // @ts-ignore
                    .mockReturnValue(null);
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/forgot-password').send(userInput);
                expect(statusCode).toBe(400);
            }));
        });
        describe('given valid data', () => {
            it('should return a 200', () => __awaiter(void 0, void 0, void 0, function* () {
                const userOTPVerification = {
                    userId,
                    expiresAt: Date.now() + 100,
                    otp: 'somerandomhash'
                };
                jest
                    .spyOn(AuthService, 'generateOtp')
                    .mockResolvedValue('1234');
                jest.spyOn(AuthService, 'findUserByEmail')
                    // @ts-ignore
                    .mockReturnValue(userPayload);
                jest
                    .spyOn(AuthService, 'deleteUserOtp')
                    .mockResolvedValue({});
                const sendToQueueMock = jest
                    .spyOn(queue, 'sendToQueue')
                    .mockResolvedValue();
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/forgot-password').send(userInput);
                expect(statusCode).toBe(200);
            }));
        });
    });
    describe('reset password route', () => {
        describe('given no user exists with the email given', () => {
            it('should throw a bad request error', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(AuthService, 'findUserByEmail')
                    // @ts-ignore
                    .mockReturnValue(null);
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/reset').send(userInput);
                expect(statusCode).toBe(400);
            }));
        });
        describe('given empty payload sent', () => {
            it('should throw a bad request error', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(AuthService, 'findUserByEmail')
                    // @ts-ignore
                    .mockReturnValue(null);
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/reset').send({});
                expect(statusCode).toBe(400);
            }));
        });
        describe('given otp sent to user not found', () => {
            it('should throw a bad request error', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = { userId, otp: "1235" };
                jest
                    .spyOn(AuthService, 'findUserWithOtp')
                    .mockResolvedValue([]);
                jest
                    .spyOn(AuthService, 'deleteUserOtp')
                    .mockResolvedValue({});
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/reset').send(data);
                expect(statusCode).toBe(400);
            }));
        });
        describe('given otp sent has expired', () => {
            it('should return a 400', () => __awaiter(void 0, void 0, void 0, function* () {
                jest
                    .spyOn(AuthService, 'findUserWithOtp')
                    .mockResolvedValue([{ expiresAt: Date.now() - 10, otp: "hashedOtp" }]);
                jest
                    .spyOn(AuthService, 'deleteUserOtp')
                    .mockResolvedValue({});
                const data = { userId, otp: "1235" };
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/reset').send(data);
                expect(statusCode).toBe(400);
            }));
        });
        describe('given an invalid otp', () => {
            it('should throw a bad request error', () => __awaiter(void 0, void 0, void 0, function* () {
                jest
                    .spyOn(AuthService, 'findUserWithOtp')
                    .mockResolvedValue([{ expiresAt: Date.now() + 1000, otp: 'hashedOtp' }]);
                jest
                    .spyOn(bcryptMock, 'compare')
                    .mockImplementation((plain, hash) => Promise.resolve(false));
                const data = { userId, otp: "1235" };
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/reset').send(data);
                expect(statusCode).toBe(400);
            }));
        });
        describe('given valid data', () => {
            it('should return a success', () => __awaiter(void 0, void 0, void 0, function* () {
                const payload = Object.assign(Object.assign({ userId }, userInput), { otp: '1234' });
                const userOTPVerification = {
                    userId,
                    expiresAt: Date.now() + 100000,
                    otp: bcrypt_1.default.hashSync(payload.otp, 10)
                };
                jest.spyOn(AuthService, 'findUserByEmail')
                    // @ts-ignore
                    .mockReturnValue(userPayload);
                jest
                    .spyOn(AuthService, 'deleteUserOtp')
                    .mockResolvedValue({});
                jest
                    .spyOn(user_otp_verification_model_1.default, 'find')
                    .mockResolvedValue([userOTPVerification]);
                // jest
                // .spyOn(bcryptMock, 'compare')
                // .mockImplementation((plain, hash) => Promise.resolve(true))
                const { statusCode, body } = yield (0, supertest_1.default)(app_1.default).post('/api/v1/auth/reset').send(payload);
                expect(statusCode).toBe(200);
            }));
        });
    });
});
