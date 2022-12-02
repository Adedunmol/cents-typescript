import mongoose from "mongoose";

export {};

interface User {
    email: string;
    id: mongoose.Types.ObjectId;
    roles: number[];
}

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
