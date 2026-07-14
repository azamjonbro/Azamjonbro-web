import { Router } from "express";
import { register, login, logout, refreshToken, me, updateProfile } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, updateProfile);

export default router;
