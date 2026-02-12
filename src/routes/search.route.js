import { Router } from "express";
import { searchAll } from "../contollers/search.controller.js";

const router = Router();

router.route("/").get(searchAll);

export default router;
