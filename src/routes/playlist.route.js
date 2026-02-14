import { Router } from "express";
import { createPlaylist , getUserPlaylists,getPlaylistById,addVideoToPlaylist,removeVideoFromPlaylist,deletePlaylist,updatePlaylist} from "../contollers/playlist.controller.js"; 
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router=Router();
router.use(verifyJWT)

router.route("/").post(createPlaylist)

// Specific routes MUST come before generic routes
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)
router.route("/users/:userId").get(getUserPlaylists)

// Generic routes come after
router.route("/:playlistId")
.get(getPlaylistById)
.patch(updatePlaylist)
.delete(deletePlaylist)

export default router;