import { Router } from "express";
import { getDashboardStats, getUsers, updateUserRole, toggleUserStatus, getSystemLogs } from "./admin.controller";
import { authMiddleware, rbacMiddleware } from "../../middlewares/auth";

const router = Router();

router.get("/stats", authMiddleware, rbacMiddleware(["admin"]), getDashboardStats);
router.get("/users", authMiddleware, rbacMiddleware(["admin"]), getUsers);
router.patch("/users/:id/role", authMiddleware, rbacMiddleware(["admin"]), updateUserRole);
router.patch("/users/:id/status", authMiddleware, rbacMiddleware(["admin"]), toggleUserStatus);
router.get("/logs", authMiddleware, rbacMiddleware(["admin"]), getSystemLogs);

export default router;
