import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video iid format")
    }
    const pageNumber = Math.max(Number(page), 1)
    const limitNumber = Math.max(Number(limit), 1)
    const skip = (pageNumber - 1) * limitNumber


    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("owner", "username avatar")

    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId format")
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    await comment.populate("owner", "username avatar")

    return res.status(201).json(new ApiResponse(200, comment, "Comment added successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {commentId}=req.params
    const {content}=req.body
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid comment id format")
    }
    if(!content || !content.trim()){
        throw new ApiError(400,"Comment content is required")
    }
    const comment=await Comment.findById(commentId)
    if (!comment) {
    throw new ApiError(404, "Comment not found")
}
    if(comment.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to update this comment")
    }

    comment.content=content
    await comment.save()

    await comment.populate("owner","username avatar")

    return res.status(200).json(new ApiResponse(200,comment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid comment id format")
    }
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    if(comment.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(new ApiResponse(200,{},"Comment delete successfully"))
})

const getTweetComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a tweet
    const { tweetId } = req.params
    const { page = 1, limit = 10 } = req.query
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet id format")
    }
    const pageNumber = Math.max(Number(page), 1)
    const limitNumber = Math.max(Number(limit), 1)
    const skip = (pageNumber - 1) * limitNumber

    console.log('Fetching comments for tweetId:', tweetId);
    const comments = await Comment.find({ tweet: new mongoose.Types.ObjectId(tweetId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("owner", "username avatar")
    console.log('Comments found:', comments.length, comments);

    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

const addTweetComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a tweet
    const { tweetId } = req.params;
    const { content } = req.body

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweetId format")
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const comment = await Comment.create({
        content,
        tweet: new mongoose.Types.ObjectId(tweetId),
        owner: req.user._id
    })
    await comment.populate("owner","username avatar")

    return res.status(201).json(new ApiResponse(200, comment, "Comment to the tweet added successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
    getTweetComments,
    addTweetComment
}
