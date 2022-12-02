require('dotenv').config()
import app from "./app";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000

mongoose.connection.once('open', () => {
    console.log('Database Connected')
    app.listen(PORT, () => {
        console.log(`App is listening on port ${PORT}...`)
    })
})