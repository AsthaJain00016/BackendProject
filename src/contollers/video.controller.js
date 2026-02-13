import mongoose from "mongoose";
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/clodinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    //Pagination is a backend technique used to divide large datasets into smaller chunks to improve performance, scalability, and user experience.
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);


    const skip = (pageNumber - 1) * limitNumber;

    const filter = {
        isPublished:true
    }  //This object will decide:which videos should be fetched Initially empty → fetch all videos.

    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    }

    if (userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user id format");
    }
    filter.owner = userId;
    }

    const sort = {};
    sort[sortBy] = sortType === "asc" ? 1 : -1

    const videos = await Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .populate("owner","username avatar")

    const totalVideos = await Video.countDocuments(filter)

    const totalPages = Math.ceil(totalVideos / limitNumber)

    return res.status(200)
        .json(new ApiResponse(
            200,
            {
                data: videos,
                pagination: {
                    totalVideos,
                    totalPages,
                    currentPage: pageNumber,
                    limit: limitNumber
                }
            }
        ))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    /*
    Validate input
↓
Get uploaded file
↓
Upload to cloud storage
↓
Save metadata in DB
↓
Send success response

    */
   console.log("FILES:", req.files);
console.log("BODY:", req.body);


    if (!title || !description) {
        throw new ApiError(401, "Title and descriptiion are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0].path

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is missing")
    }

    const video = await uploadOnCloudinary(videoFileLocalPath)

    if (!video.url) {
        throw new ApiError(400, "Error while uploading video file ")
    }

    const videoUrl = video.url;
    const duration = video.duration;
    const publicId = video.public_id

    if (!duration || !publicId) {
        throw new ApiError(400, "Meta data of  video is missing from cloudinary")
    }
    const thumbnailLocalPath=req.files?.thumbnail?.[0]?.path;
    let thumbnail;

    if(thumbnailLocalPath){
        const uploadThumbnail=await uploadOnCloudinary(thumbnailLocalPath);
        thumbnail=uploadThumbnail.url;
    }
    else{
        thumbnail = video.thumbnail_url || video.secure_url.replace(".mp4", ".jpg");
    }
     

    const videoDocument = await Video.create({
        videoFile: videoUrl,
        thumbnail,
        title,
        description,
        duration,
        owner: req.user._id,

    });

    return res.status(201)
        .json(new ApiResponse(201, videoDocument, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    /*
    Get videoId
↓
Validate ObjectId
↓
Fetch video
↓
If not found → 404
↓
Optional: increment views
↓
Send response
 */
    if (!videoId) {
        throw new ApiError(400, "video id is missing, cannot be able to find the video")
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID format");
    }
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views: 1 }
        },
        {
            new: true
        }
    ).populate("owner", "username avatar");

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    return res.status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully through video id"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    // 1. get video id
    //2. validate video id
    //3. update video details on data base
    //4. send response
    const { title, description } = req.body;

    if (!videoId) {
        throw new ApiError(400, "Video id is missing")
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id format")
    }
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }



    const updatedFields = {}
    if (title) {
        updatedFields.title = title
    }
    if (description) {
        updatedFields.description = description
    }
    
    if(req.file?.path){
        const uploadThumbnail=await uploadOnCloudinary(req.file.path);
        updatedFields.thumbnail=uploadThumbnail;
    }

    else if(req.body.thumbnail){
        updatedFields.thumbnail=req.body.thumbnail;
    }
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updatedFields
        },
        {
            new: true
        }
    )

    return res.status(200)
        .json(new ApiResponse(200, updatedVideo, "Video details updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(400, "Video id is missing")
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id format")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }


    const urlParts = video.videoFile.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const publicId = fileName.split(".")[0];
    await deleteFromCloudinary(publicId)
    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(new ApiResponse(200, {}, "Video delete successfully"));

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    /*
 Get video ID from req.params
Validate video ID (ObjectId, exists)
Fetch video from DB
Check if current user is owner
Only the uploader can toggle visibility
Flip the isPublished field
Save updated video
Return updated video info  */

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id format")
    }

    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    if(video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized  to change the publish status of this video")
    }

    video.isPublished=!video.isPublished;
    await video.save()

    return res.status(200).json(new ApiResponse(200,video,"Publish status changed successfully"))
})

const getUserVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);

    const skip = (pageNumber - 1) * limitNumber;

    const filter = {
        owner: req.user._id
    }

    const sort = {};
    sort[sortBy] = sortType === "asc" ? 1 : -1

    const videos = await Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .populate("owner","username avatar")

    const totalVideos = await Video.countDocuments(filter)

    const totalPages = Math.ceil(totalVideos / limitNumber)

    return res.status(200)
        .json(new ApiResponse(
            200,
            {
                data: videos,
                pagination: {
                    totalVideos,
                    totalPages,
                    currentPage: pageNumber,
                    limit: limitNumber
                }
            }
        ))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getUserVideos
}
