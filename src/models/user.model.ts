import mongoose, { Document, model, Schema } from "mongoose";
import bcrypt from 'bcrypt';

export interface UserDocument extends Document {
    username: string;
    fullName: string;
    email: string;
    password: string;
    comparePassword(password: string): Promise<boolean>;
    roles: {
        Admin?: number;
        Moderator?: number;
        User: number
    },
    verified: boolean;
    refreshToken: string[];
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Please provide username'],
        trim: true
    },
    fullName: {
        type: String,
        required: [true, 'Please provide full name']
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true
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
})

userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
    const user = this as UserDocument

    return bcrypt.compare(password, user.password).catch((e: any) => false)
}

userSchema.pre('save', async function (next: any) {
    let user = this as UserDocument

    if (!user.isModified('password')) return next()

    const salt = await bcrypt.genSalt(10)
    const hashedPwd = await bcrypt.hash(user.password, salt)

    user.password = hashedPwd

    return next()
})

const User = model<UserDocument>('User', userSchema)

export default User;