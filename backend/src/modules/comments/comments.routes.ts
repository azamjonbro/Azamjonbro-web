import { Router } from "express";
import { addComment, getComments, deleteComment } from "./comments.controller";
import { authMiddleware, optionalAuthMiddleware } from "../../middlewares/auth";

const router = Router();

router.post("/", authMiddleware, addComment);
router.get("/", getComments);
router.delete("/:id", authMiddleware, deleteComment);

export default router;
