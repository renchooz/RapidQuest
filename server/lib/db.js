import mongoose from "mongoose";
import 'dotenv/config'

export const connectDb = async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/whatsapp`)
        console.log('database connected')
    } catch (error) {
        return console.log('error in db '+ error)
    }
}