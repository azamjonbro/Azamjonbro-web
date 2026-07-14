import { Router } from "express";
import { getArticles, getArticleBySlug, getCategories, getTags } from "./blog.controller";

const router = Router();

router.get("/articles", getArticles);
router.get("/articles/:slug", getArticleBySlug);
router.get("/categories", getCategories);
router.get("/tags", getTags);

export default router;
