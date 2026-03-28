// require('dotenv').config({path: './env'})  // require and import both hamper the consistency of appn

// We use dotenv to securely load custom variables from a .env file into process.env so they aren't hardcoded in our source code.

import dotenv from "dotenv"

// import mongoose from "mongoose"
// import { DB_NAME } from "./constants"
import connectDB from "./db/index.js"

dotenv.config( {
    path: './env'
})


// from second approach write the code for db connection in another file in db folder

connectDB()




/*    first approach

import express from "express"

const app = express()

// function connectdb(){}
// connectdb()   this is fine

// iffi (try to start with semicolon)
;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log('error: appn not able to talk',error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`app is listening on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("error: ",error);
        throw error
        
    }
}) ()

*/