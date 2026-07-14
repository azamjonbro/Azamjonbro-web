import { Router } from "express";
import { validateIdea, getValidationByToken, getSavedValidations } from "./startup.controller";
import { optionalAuthMiddleware, authMiddleware } from "../../middlewares/auth";

const router = Router();

router.post("/validate", optionalAuthMiddleware, validateIdea);
router.get("/saved", authMiddleware, getSavedValidations);
router.get("/:token", getValidationByToken);

export default router;
