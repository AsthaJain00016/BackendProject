import mongoose from "mongoose";
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    /*
Get content
↓
Validate content
↓
Create tweet with owner = req.user._id
↓
Return response
     */
    const {content}=req.body

    if(!content){
        throw new ApiError(400,"Tweet content is required");
    }

    const tweet=await Tweet.create({
        content,
        owner:req.user._id
    })

    return res.status(201).json(new ApiResponse(201,tweet,"Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params;
     if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user id format");
    }

    const tweets=await Tweet.find({
        owner:userId
    })
    .sort({createdAt:-1})
    .populate("owner","username avatar")

    // Add like information for each tweet
    const tweetsWithLikes = await Promise.all(
        tweets.map(async (tweet) => {
            const likesCount = await mongoose.model('Like').countDocuments({ tweet: tweet._id });
            const isLiked = req.user ? await mongoose.model('Like').findOne({ tweet: tweet._id, likedBy: req.user._id }) : false;
            return {
                ...tweet.toObject(),
                likesCount,
                isLiked: !!isLiked
            };
        })
    );

    return res.status(200).json(new ApiResponse(200,tweetsWithLikes,"User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params;
    const {content}=req.body
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Inavlid tweetId format")
    }

   if(!content){
    throw new ApiError(400,"Content is required")
   }
    
   const tweet=await Tweet.findById(tweetId)

   if(!tweet){
    throw new ApiError(404,"tweet not found")
   }

   if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    tweet.content=content;
    await tweet.save()

    await tweet.populate("owner", "username avatar");

   return res.status(200).json(new ApiResponse(200,tweet,"Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params;

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"invalid tweet id format")
    }

    const tweet=await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }

    if(tweet.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to delete this tweet")
    }

    await tweet.deleteOne()

    return res.status(200).json(new ApiResponse(200,{},"Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}