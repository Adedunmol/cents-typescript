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
exports.generateOtp = exports.updateUserVerification = exports.deleteUserOtp = exports.findUserWithOtp = exports.validatePassword = exports.findUserWithToken = exports.findUserById = exports.findUserByEmail = exports.createUser = void 0;
const lodash_1 = require("lodash");
const errors_1 = require("../errors");
const user_model_1 = __importDefault(require("../models/user.model"));
const user_otp_verification_model_1 = __importDefault(require("../models/user-otp-verification.model"));
const internal_server_error_1 = require("../errors/internal-server-error");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createUser = (input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.create(input);
        return (0, lodash_1.pick)(user.toJSON(), ['_id', 'email', 'fullName', 'username']);
    }
    catch (err) {
        if (err.code && err.code === 11000) {
            const message = `Duplicate value entered for ${Object.keys(err.keyValue)} field`;
            throw new errors_1.ConflictError(message);
        }
        throw new internal_server_error_1.InternalServerError('An error occurred on the server');
    }
});
exports.createUser = createUser;
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_model_1.default.findOne({ email });
    }
    catch (err) {
        throw new errors_1.NotFoundError(err);
    }
});
exports.findUserByEmail = findUserByEmail;
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_model_1.default.findById(id);
    }
    catch (err) {
        throw new errors_1.NotFoundError(err);
    }
});
exports.findUserById = findUserById;
const findUserWithToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_model_1.default.findOne({ refreshToken });
    }
    catch (err) {
        throw new errors_1.NotFoundError(err);
    }
});
exports.findUserWithToken = findUserWithToken;
const validatePassword = ({ password, email }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, exports.findUserByEmail)(email);
        if (!user)
            return false;
        const match = yield user.comparePassword(password);
        if (!match)
            return false;
        return user;
    }
    catch (err) {
        throw new errors_1.UnauthorizedError(err);
    }
});
exports.validatePassword = validatePassword;
const findUserWithOtp = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otp = yield user_otp_verification_model_1.default.find({ userId });
        return otp;
    }
    catch (err) {
        throw new errors_1.NotFoundError(err);
    }
});
exports.findUserWithOtp = findUserWithOtp;
const deleteUserOtp = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_otp_verification_model_1.default.deleteMany({ userId });
    }
    catch (err) {
        throw new Error(err);
    }
});
exports.deleteUserOtp = deleteUserOtp;
const updateUserVerification = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findOneAndUpdate({ _id: userId }, { verified: true }, { new: true });
        return user === null || user === void 0 ? void 0 : user.toJSON();
    }
    catch (err) {
        throw new errors_1.NotFoundError(err);
    }
});
exports.updateUserVerification = updateUserVerification;
const generateOtp = (userId, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const OTP_EXPIRATION = 3600000;
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const hashedOTP = yield bcrypt_1.default.hash(otp, 10);
        const userOTPVerification = yield user_otp_verification_model_1.default.create({
            userId,
            otp: hashedOTP,
            expiresAt: Date.now() + OTP_EXPIRATION
        });
        return otp;
    }
    catch (err) {
        throw new internal_server_error_1.InternalServerError(err);
    }
});
exports.generateOtp = generateOtp;
