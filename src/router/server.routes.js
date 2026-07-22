import express from "express";
import { serverStatus } from "../controllers/server.controller.js";

const router = express.Router();

router.get("/status", serverStatus);

export default router;