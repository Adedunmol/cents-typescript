import mongoose, { Document, model, Schema } from "mongoose";

export interface ClientDocument extends Document {
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
        required: [true, 'Please provide email']
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


const Client = model<ClientDocument>('Client', clientSchema)

export default Client;