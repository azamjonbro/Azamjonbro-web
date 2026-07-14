import { Router } from "express";
import { logToolUsage, getToolHistory, clearToolHistory, formatSql, testApi } from "./tools.controller";
import { optionalAuthMiddleware } from "../../middlewares/auth";

const router = Router();

router.post("/log", optionalAuthMiddleware, logToolUsage);
router.get("/history", optionalAuthMiddleware, getToolHistory);
router.post("/history/clear", optionalAuthMiddleware, clearToolHistory);
router.post("/format-sql", formatSql);
router.post("/test-api", testApi);

export default router;
