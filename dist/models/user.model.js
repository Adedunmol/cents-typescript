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
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, 'Please provide username'],
        trim: true,
        unique: true
    },
    fullName: {
        type: String,
        required: [true, 'Please provide full name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide password']
    },
    roles: {
        Admin: Number,
        Moderator: Number,
        User: {
            type: Number,
            default: 1984
        }
    },
    verified: Boolean,
    refreshToken: [String]
}, {
    timestamps: true
});
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        return bcrypt_1.default.compare(password, user.password).catch((e) => false);
    });
};
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = this;
        if (!user.isModified('password'))
            return next();
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPwd = yield bcrypt_1.default.hash(user.password, salt);
        user.password = hashedPwd;
        return next();
    });
});
const User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
