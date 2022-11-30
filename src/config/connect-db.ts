import mongoose from "mongoose";

export const connectDB = async (connectionUri: string) => {
    try {
       await mongoose.connect(connectionUri)
    } catch (err: any) {
        console.log(err)
    }
}