import { Router } from "express";
import { toggleCommentLike , toggleVideoLike , toggleTweetLike, toggleVideoDislike, getLikedVideos , checkVideoLikeStatus} from "../contollers/likes.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router=Router()

router.use(verifyJWT)

// More specific routes must come before generic routes
router.route("/toggle/dislike/v/:videoId").post(toggleVideoDislike)
router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)
router.route("/toggle/t/:tweetId").post(toggleTweetLike)
router.route("/videos").get(getLikedVideos)
router.route("/status/:videoId").get(checkVideoLikeStatus)

export default router;
