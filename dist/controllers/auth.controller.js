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
exports.resetPasswordController = exports.resetPasswordRequestController = exports.resendOTPController = exports.verifyOtpController = exports.refreshTokenController = exports.logoutController = exports.loginController = exports.registerController = void 0;
const auth_service_1 = require("../service/auth.service");
const admin_list_1 = __importDefault(require("../config/admin_list"));
const errors_1 = require("../errors");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const bcrypt_1 = __importDefault(require("bcrypt"));
const producer_1 = require("../queue/producer");
const logger_1 = __importDefault(require("../utils/logger"));
const registerController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (admin_list_1.default.has(req.body.email)) {
            req.body.roles = {
                Admin: 3001,
                User: 1984,
                Moderator: 2150
            };
        }
        const user = yield (0, auth_service_1.createUser)(req.body);
        const otp = yield (0, auth_service_1.generateOtp)(user._id, user.email);
        const emailData = {
            template: "verification",
            locals: { username: user.username, otp },
            to: user.email
        };
        logger_1.default.info(`created user ${user.username}`);
        yield (0, producer_1.sendToQueue)('emails', emailData); // send verification mail to user
        return res.status(http_status_codes_1.StatusCodes.CREATED).json({ status: 'success', message: 'user created successfully', data: user });
    }
    catch (err) {
        return res.status(409).send('user exists');
    }
});
exports.registerController = registerController;
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const cookie = req.cookies;
    const user = yield (0, auth_service_1.validatePassword)({ email, password });
    if (user) {
        const roles = Object.values(user.roles);
        const accessToken = jsonwebtoken_1.default.sign({
            UserInfo: {
                email: user.email,
                id: user._id,
                roles: roles
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({
            email: user.email
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
        let newRefreshTokenArray = !(cookie === null || cookie === void 0 ? void 0 : cookie.jwt) ? user.refreshToken : user.refreshToken.filter(token => token !== (cookie === null || cookie === void 0 ? void 0 : cookie.jwt));
        if (cookie === null || cookie === void 0 ? void 0 : cookie.jwt) {
            res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60, sameSite: 'none' });
            const foundUser = yield (0, auth_service_1.findUserWithToken)(cookie.jwt);
            if (foundUser) {
                newRefreshTokenArray = [];
            }
        }
        user.refreshToken = [...newRefreshTokenArray, refreshToken];
        const result = yield user.save();
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 15 * 60 * 1000, sameSite: 'none' });
        return res.status(http_status_codes_1.StatusCodes.OK).json({ status: 'success', message: '', data: { accessToken, expiresIn: 15 * 60 * 1000 } });
    }
    throw new errors_1.UnauthorizedError('Invalid credentials');
});
exports.loginController = loginController;
const logoutController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookie = req.cookies;
    if (!cookie)
        return res.sendStatus(http_status_codes_1.StatusCodes.NO_CONTENT);
    const refreshToken = cookie.jwt;
    const foundUser = yield (0, auth_service_1.findUserWithToken)(refreshToken);
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60, sameSite: 'none' });
        return res.sendStatus(http_status_codes_1.StatusCodes.NO_CONTENT);
    }
    foundUser.refreshToken = foundUser.refreshToken.filter(token => token !== refreshToken);
    res.clearCookie('jwt', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none' });
    const result = yield foundUser.save();
    return res.sendStatus(http_status_codes_1.StatusCodes.NO_CONTENT);
});
exports.logoutController = logoutController;
const refreshTokenController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookie = req.cookies;
    if (!(cookie === null || cookie === void 0 ? void 0 : cookie.jwt)) {
        throw new errors_1.UnauthorizedError('You are not authorized to access this route');
    }
    const refreshToken = cookie.jwt;
    res.clearCookie('jwt', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none' });
    const user = yield (0, auth_service_1.findUserWithToken)(refreshToken);
    //reuse detected
    if (!user) {
        jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, {}, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                throw new errors_1.ForbiddenError('bad token for reuse');
            }
            let decodedData = data;
            const user = yield (0, auth_service_1.findUserByEmail)(decodedData === null || decodedData === void 0 ? void 0 : decodedData.email);
            if (user) {
                user.refreshToken = [];
            }
        }));
        throw new errors_1.UnauthorizedError('Token reuse');
    }
    let newRefreshTokenArray = user.refreshToken.filter(token => token !== refreshToken);
    jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, {}, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            user.refreshToken = [...newRefreshTokenArray];
            const result = yield user.save();
        }
        let decodedData = data;
        if (err || decodedData.email !== user.email) {
            throw new errors_1.ForbiddenError('Bad Token');
        }
        const roles = Object.values(user.roles);
        const accessToken = jsonwebtoken_1.default.sign({
            UserInfo: {
                id: user._id,
                email: user.email,
                roles: roles
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
        const newRefreshToken = jsonwebtoken_1.default.sign({
            email: user.email
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
        user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = yield user.save();
        res.cookie('jwt', newRefreshToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none' });
        return res.status(http_status_codes_1.StatusCodes.OK).json({ status: 'success', message: '', data: { accessToken, expiresIn: 15 * 60 * 1000 } });
    }));
});
exports.refreshTokenController = refreshTokenController;
const verifyOtpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userOTPRecords = yield (0, auth_service_1.findUserWithOtp)(req.body.userId.trim());
    if (userOTPRecords.length <= 0) {
        throw new errors_1.BadRequestError("Account record doesn't exist or has been verified already. Please sign up or log in.");
    }
    // user otp record exists
    const { expiresAt } = userOTPRecords[0];
    const hashedOTP = userOTPRecords[0].otp;
    if (expiresAt < Date.now()) {
        yield (0, auth_service_1.deleteUserOtp)(req.body.userId.trim());
        throw new errors_1.BadRequestError("Code has expired. Please request again.");
    }
    const validOTP = yield bcrypt_1.default.compare(req.body.otp, hashedOTP);
    if (!validOTP) {
        throw new errors_1.BadRequestError("Invalid code passed. Check your inbox.");
    }
    const user = yield (0, auth_service_1.updateUserVerification)(req.body.userId.trim());
    yield (0, auth_service_1.deleteUserOtp)(req.body.userId.trim());
    return res.status(200).json({ status: "verified", message: "User email verified successfully", data: { id: user === null || user === void 0 ? void 0 : user.id } });
});
exports.verifyOtpController = verifyOtpController;
const resendOTPController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, auth_service_1.deleteUserOtp)(req.body.userId.trim());
    const user = yield (0, auth_service_1.findUserById)(req.body.userId.trim());
    if (!user)
        throw new errors_1.NotFoundError("No user found with this id");
    const otp = yield (0, auth_service_1.generateOtp)(user.id, user.email);
    const emailData = {
        template: "verification",
        locals: { username: user.username, otp },
        to: user.email
    };
    yield (0, producer_1.sendToQueue)('emails', emailData); // send verification mail to user
    return res.status(200).json({ status: "pending", message: "Verification OTP email sent", data: { userId: req.body.userId, email: req.body.email } });
});
exports.resendOTPController = resendOTPController;
const resetPasswordRequestController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_service_1.findUserByEmail)(req.body.email.trim());
    if (!user)
        throw new errors_1.NotFoundError("No user found with this email");
    if (!user.verified)
        throw new errors_1.BadRequestError("Email hasn't been verified yet. Check your inbox.");
    const otpDetails = {
        email: req.body.email.trim(),
        _id: user.id
    };
    yield (0, auth_service_1.deleteUserOtp)(user.id);
    const otp = yield (0, auth_service_1.generateOtp)(user.id, user.email);
    const emailData = {
        template: "forgot-password",
        locals: { otp },
        to: user.email
    };
    yield (0, producer_1.sendToQueue)('emails', emailData); // send verification mail to user
    return res.status(200).json({ status: "success", message: "otp has been sent to the provided email", data: { userId: user.id, email: user.email, otp: '1234' } }); // userOTPVerification.otp
});
exports.resetPasswordRequestController = resetPasswordRequestController;
const resetPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_service_1.findUserByEmail)(req.body.email.trim());
    if (!user)
        throw new errors_1.NotFoundError("No user found with this email");
    const userOTPRecords = yield (0, auth_service_1.findUserWithOtp)(user.id);
    if (userOTPRecords.length <= 0) {
        throw new errors_1.BadRequestError("Password reset request has not been made.");
    }
    // user otp record exists
    const { expiresAt } = userOTPRecords[0];
    const hashedOTP = userOTPRecords[0].otp;
    if (expiresAt < Date.now()) {
        yield (0, auth_service_1.deleteUserOtp)(user.id);
        throw new errors_1.BadRequestError("Code has expired. Please request again.");
    }
    const validOTP = yield bcrypt_1.default.compare(req.body.otp.trim(), hashedOTP);
    if (!validOTP) {
        throw new errors_1.BadRequestError("Invalid code passed. Check your inbox.");
    }
    user.password = req.body.password.trim();
    const result = yield user.save();
    yield (0, auth_service_1.deleteUserOtp)(user.id);
    return res.status(200).json({ status: "success", message: "Password changed successfully", data: null });
});
exports.resetPasswordController = resetPasswordController;
