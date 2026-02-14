import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserById, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, addToWatchHistory } from "../contollers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)

router.route("/login").post(loginUser)

// Secured Routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/user/:id").get(verifyJWT, getUserById)
router.route("/watch-history").get(verifyJWT, getWatchHistory)
router.route("/watch-history/:videoId").post(verifyJWT, addToWatchHistory)
// Saved videos
router.route("/save/:videoId").post(verifyJWT, async (req, res, next) => {
    // delegate to controller handler
    try {
        const { toggleSaveVideo } = await import('../contollers/user.controller.js');
        return toggleSaveVideo(req, res, next);
    } catch (err) {
        return next(err);
    }
});

router.route("/saved-videos").get(verifyJWT, async (req, res, next) => {
    try {
        const { getSavedVideos } = await import('../contollers/user.controller.js');
        return getSavedVideos(req, res, next);
    } catch (err) {
        return next(err);
    }
});

router.route("/saved/check/:videoId").get(verifyJWT, async (req, res, next) => {
    try {
        const { checkVideoSaved } = await import('../contollers/user.controller.js');
        return checkVideoSaved(req, res, next);
    } catch (err) {
        return next(err);
    }
});

export default router;
