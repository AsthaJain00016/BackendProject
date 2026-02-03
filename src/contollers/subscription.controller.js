import mongoose,{isValidObjectId} from "mongoose";
import { User } from "../models/user.model.js";
import {Subscription} from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriberId=req.user._id // jo channel ko subscribe krega
    // TODO: toggle subscription
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invald channel id format")
    }

    if(channelId===subscriberId){
        throw new ApiError(400,"You cannot to sunbscribe to yourself")
    }

    const existingSubscription=await Subscription.findOne({
        subscriber:subscriberId,
        channel:channelId
    })

    if(existingSubscription){
        // agar pehle se subscribe kr rkha hai toh unsubscribe krege
        await Subscription.findByIdAndDelete(existingSubscription._id)

        return res.status(200).json(new ApiResponse(200,{subscribed:false},"Unsubscribed successfully"))
    }
    else{
        // subscribe to the channel
        await Subscription.create({
            subscriber:subscriberId,
            channel:channelId
        })

        return res.status(200).json(new ApiResponse(200,{subscribed:true},"Subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel id format")
    }

    const count=await Subscription.countDocuments({
        channel:channelId
    })
    return res.status(200).json(new ApiResponse(200,count,"Subcribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    const subscriptions=await Subscription.find({
        subscriber:subscriberId
    }).populate("channel","username avatar")
    return res.status(200).json(new ApiResponse(200,{
        totalSubscriptions:subscriptions.length,
        channels:subscriptions
    },"channels fetched successfully"))

})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}