import mongoose from "mongoose";

export  const chatSchema=new mongoose.Schema({
    username:String,
    message:String,
    time:String,
    profile_image:Number
})
export const chatModel=mongoose.model('chat',chatSchema)