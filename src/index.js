import dotenv from 'dotenv'
dotenv.config({ path: './env' })
import connectDB from "./db/index.js";


connectDB()


















/*
First approch to connect to database
import express  from 'express'

const app=express()

(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error: ",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is runnning on ${process.env.PORT}`)
        })
    }catch(error){
        console.error("Error: ",error)
        throw error
    }
})()
*/