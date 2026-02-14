import mongoose from "mongoose";
import { Playlist } from '../models/playlist.model.js'
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videoId } = req.body
    if (!name || !description) {
        throw new ApiError(400, "name and description both are required")
    }
    //TODO: create playlistExpand commentComment on line R11

    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: req.user._id
    })

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user id format")
    }

    const playlists = await Playlist.find({ owner: userId })
        .sort({ createdAt: -1 })
        .populate("owner", "username avatar");
    return res.status(200).json(new ApiResponse(200, playlists, "Playlist fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist id format")
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("owner", "username avatar")
        .populate("videos");
    if (!playlist) {
        throw new ApiError(404, "Playlist does not exists")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully through ID"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist id format")
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id format")
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "you are not authorized to add videos to this playlist")
    }

    // Check if video exists (properly convert both to strings for comparison)
    const videoAlreadyExists = playlist.videos.some(vid => vid.toString() === videoId.toString());
    if (videoAlreadyExists) {
        throw new ApiError(400, "video already exists in the playlist")
    }

    playlist.videos.push(videoId)
    await playlist.save()

    await playlist.populate('videos')

    return res.status(200).json(new ApiResponse(200, playlist, "Video added successfully to the playlist"))
})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist id format")
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id format")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $pull: { videos: videoId }
        },
        {
            new: true
        }
    ).populate("videos")
    if (!playlist) {
        throw new ApiError(
            404,
            "Playlist not found or you are not authorized to modify it"
        )
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Video removed successfully from the playlist"))

})


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid playlist id format")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist doesn't exists")
    }
    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to delete this video")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(new ApiResponse(200,{},"Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid playlist id format")
    }
     if (!name && !description) {
        throw new ApiError(400, "At least one field (name or description) is required")
    }

    const playlist=await Playlist.findOneAndUpdate(
        {
            _id:playlistId,
            owner:req.user._id
        },
        {
            $set:{
                ...(name && {name}),
                ...(description && {description})
            }
        },
        {
            new : true
        }
    ).populate("videos")

    if(!playlist){
        throw new ApiError(404,"Playlist not found or you are not authorized to update this playlist")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"Playlist updated successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}