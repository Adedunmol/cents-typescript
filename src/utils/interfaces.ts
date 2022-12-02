import { Request } from 'express';
import jwt, { DecodeOptions } from 'jsonwebtoken';
import mongoose from "mongoose";


export interface DecodedToken extends DecodeOptions {
    email: string;
    id: mongoose.Types.ObjectId;
    roles: number[];
}
