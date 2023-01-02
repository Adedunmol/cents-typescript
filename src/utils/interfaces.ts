import { Request } from 'express';
import jwt, { DecodeOptions } from 'jsonwebtoken';
import mongoose, { DocumentDefinition } from "mongoose";
import { InvoiceDocument } from '../models/invoice.model'

export interface DecodedToken extends DecodeOptions {
    email: string;
    id: mongoose.Types.ObjectId;
    roles: number[];
}

export interface DecodedData {
    UserInfo: DecodedToken
}

export interface emailData {
    invoice: DocumentDefinition<InvoiceDocument>;
    dueDate: Date;
}
