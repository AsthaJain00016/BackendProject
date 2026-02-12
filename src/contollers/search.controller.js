import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const searchAll = asyncHandler(async (req, res) => {
    const { q: query, type = "all" } = req.query;

    if (!query) {
        return res.status(400).json(new ApiResponse(400, {}, "Query parameter is required"));
    }

    const results = {};

    if (type === "all" || type === "videos") {
        const videos = await Video.find({
            isPublished: true,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).populate("owner", "username avatar").limit(20); // Limit for performance

        results.videos = videos;
    }

    if (type === "all" || type === "users") {
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } }
            ]
        }).select("username fullName avatar").limit(20);

        results.users = users;
    }

    // Add more types if needed (e.g., tweets, playlists)

    return res.status(200).json(new ApiResponse(200, results, "Search results fetched successfully"));
});

export { searchAll };
