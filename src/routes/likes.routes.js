import { Router } from "express";
import { toggleCommentLike , toggleVideoLike , toggleTweetLike, getLikedVideos } from "../contollers/likes.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router=Router()

router.use(verifyJWT)

router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/v/:commentId").post(toggleCommentLike)
router.route("/toggle/t/:tweetId").post(toggleTweetLike)
router.route("/videos").get(getLikedVideos)

export default router;