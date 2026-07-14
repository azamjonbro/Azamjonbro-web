import { Router } from "express";
import { generateRoadmap, getRoadmapByToken, getSavedRoadmaps, exportPdf } from "./roadmaps.controller";
import { optionalAuthMiddleware, authMiddleware } from "../../middlewares/auth";

const router = Router();

router.post("/generate", optionalAuthMiddleware, generateRoadmap);
router.get("/saved", authMiddleware, getSavedRoadmaps);
router.get("/:token", getRoadmapByToken);
router.get("/:token/pdf", exportPdf);

export default router;
