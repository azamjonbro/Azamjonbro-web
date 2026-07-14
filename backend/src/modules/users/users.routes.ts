import { Router } from "express";
import { getBookmarks, toggleBookmark, getActivityLogs } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

router.get("/bookmarks", authMiddleware, getBookmarks);
router.post("/bookmarks/toggle", authMiddleware, toggleBookmark);
router.get("/activity", authMiddleware, getActivityLogs);

export default router;
