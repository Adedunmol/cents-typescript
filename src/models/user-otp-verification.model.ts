import mongoose from "mongoose";

export interface UserOTPVerificationDocument extends mongoose.Document {
    userId: mongoose.Types.ObjectId
    otp: string
    expiresAt: number
    createdAt: Date
    updatedAt: Date
}

const userOtpVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
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
}, { timestamps: true })

const UserOTPVerification = mongoose.model<UserOTPVerificationDocument>("UserOTPVerification", userOtpVerificationSchema)

export default UserOTPVerification;