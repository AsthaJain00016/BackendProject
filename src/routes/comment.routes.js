import { Router } from "express";
import { getVideoComments,addComment,updateComment,deleteComment,getTweetComments,addTweetComment } from "../contollers/comment.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router=Router()

router.use(verifyJWT);

router.route("/:videoId")
.get(getVideoComments)
.post(addComment)

router.route("/c/:commentId")
.delete(deleteComment)
.patch(updateComment)

router.route("/t/:tweetId").post(addTweetComment)
router.route("/t/:tweetId").get(getTweetComments)

export default router;