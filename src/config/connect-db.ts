import mongoose from "mongoose";

export const connectDB = async (connectionUri: string) => {
    try {
        mongoose.set('strictQuery', true)
       await mongoose.connect(connectionUri)
    } catch (err: any) {
        console.log(err)
    }
}