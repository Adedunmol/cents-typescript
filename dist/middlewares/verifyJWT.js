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
exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../errors");
const verifyJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')))
        throw new errors_1.UnauthorizedError('You do not have the access token');
    const accessToken = authHeader.split(' ')[1];
    jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, {}, (err, data) => {
        if (err)
            throw new errors_1.UnauthorizedError('You are sending a bad token');
        let decodedData = data;
        const dataObj = {
            id: decodedData.UserInfo.id,
            email: decodedData.UserInfo.email,
            roles: decodedData.UserInfo.roles
        };
        req.user = dataObj;
        next();
    });
});
exports.verifyJWT = verifyJWT;
