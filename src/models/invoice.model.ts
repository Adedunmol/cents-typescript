import mongoose, { Document, model, Schema } from "mongoose";

interface Service {
    item: string;
    rate: number;
    hours: number;
    paid: boolean;
}

export interface InvoiceDocument extends Document {
    clientFullName: string;
    clientEmail: string;
    clientPhoneNumber: string;
    services: Service[];
    total: number;
    dueDate: Date | string;
    fullyPaid: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdFor: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const invoiceSchema = new Schema({
    clientFullName: {
        type: String,
        required: [true, 'Please provide full name']
    },
    clientEmail: {
        type: String,
        required: [true, 'Please provide email'],
    },
    clientPhoneNumber: {
        type: String
    },
    services: [{
        item: String,
        rate: Number,
        hours: Number,
        paid: {
            type: Boolean,
            default: false
        }
    }],
    total: {
        type: Number
    },
    dueDate: Date,
    fullyPaid: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user']
    },
    createdFor: {
        type: mongoose.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Please provide client']
    }

}, {
    timestamps: true
})

const allServicesPaid = (currentService: Service) => currentService.paid === true

invoiceSchema.pre('save', async function () {
    const invoice = this as InvoiceDocument
    
    invoice.fullyPaid = invoice.services.every(allServicesPaid)
})

const Invoice = model<InvoiceDocument>('Invoice', invoiceSchema)

export default Invoice;