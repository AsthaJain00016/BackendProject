import mongoose from "mongoose";
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id
    //TODO: toggle like on video
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invaliid video id format")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const alreadyLiked = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if (alreadyLiked) {
        await alreadyLiked.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "Video unliked"))
    }
    else {
        await Like.create({
            video: videoId,
            likedBy: userId
        })
        return res.status(200).json(new ApiResponse(200, {}, "Video liked"))
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invaliid comment id format")
    }
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const alreadyLiked = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if (alreadyLiked) {
        await alreadyLiked.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "comment unliked"))
    }
    else {
        await Like.create({
            comment: commentId,
            likedBy: userId
        })
        return res.status(200).json(new ApiResponse(200, {}, "comment liked"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet id format")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const alreadyLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    if (alreadyLiked) {
        await alreadyLiked.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "tweet unliked"))
    }
    else {
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        })
        return res.status(200).json(new ApiResponse(200, {}, "tweet liked"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId=req.user._id
    const {page=1 , limit=10}=req.query
    const pageNumber=Math.max(Number(page) || 1,1)
    const limitNumber=Math.max(Number(limit) || 10,1)
    const skip=(pageNumber-1)*limitNumber

    const likedVideo=await Like.find({
        likedBy:userId,
        video:{$ne:null}
    })
    .populate({
        path:"video",
        populate:{
            path:"owner",
            select:"username avatar"
        }
    })
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limitNumber)

    const totalLikedVideos=await Like.countDocuments({
        likedBy:userId,
        video:{$ne:null}
    })
    
    return res.status(200).json(
        new ApiResponse(200,{data:likedVideo,
            pagination:{
                totalLikedVideos,
                page:pageNumber,
                limit:limitNumber,
                totalPages:Math.ceil(totalLikedVideos/limitNumber)
            }
        }, "Liked videos fetched successfully")
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}