import mongoose from "mongoose"
import { Env } from "./env.config.js"

const connectDatabase = async() =>{

    try{

        await mongoose.connect(Env.MONGO_URI, {

            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        })

        console.log( " Connected to MongoDB Database.");
    }
    catch(error){

        console.error( " Error connecting to MongoDB Database : ", error )
        process.exit(1) // Immediately stop the Node.js application and tell the operating system that the program ended with an error.
    }
}

export default connectDatabase

