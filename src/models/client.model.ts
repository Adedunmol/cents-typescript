import mongoose, { Document, model, Schema } from "mongoose";

interface ClientDocument extends Document {
    fullName: string;
    email: string;
    phoneNumber: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const clientSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide full name']
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true
    },
    phoneNumber: String,
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide id of user']
    }
}, {
    timestamps: true
})


export const Client = model<ClientDocument>('Client', clientSchema)