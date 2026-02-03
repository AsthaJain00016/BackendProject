import { Router } from "express";
import { toggleSubscription,getUserChannelSubscribers,getSubscribedChannels } from "../contollers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router()

router.use(verifyJWT);

router.route("/c/:channelId")
.get(getSubscribedChannels)
.post(toggleSubscription)

router.route("/u/:subscriberId").get(getUserChannelSubscribers)

export default router