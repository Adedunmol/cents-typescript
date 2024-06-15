"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userOtpVerificationSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "User"
    },
    otp: {
        type: String,
        required: [true, "Please provide otp"]
    },
    expiresAt: {
        type: Number,
        required: [true, "Please provide expiry date"]
    }
}, { timestamps: true });
const UserOTPVerification = mongoose_1.default.model("UserOTPVerification", userOtpVerificationSchema);
exports.default = UserOTPVerification;
