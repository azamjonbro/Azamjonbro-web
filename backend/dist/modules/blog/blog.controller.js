"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArticles = getArticles;
exports.getArticleBySlug = getArticleBySlug;
exports.getCategories = getCategories;
exports.getTags = getTags;
const database_1 = __importDefault(require("../../config/database"));
const response_1 = require("../../utils/response");
async function getArticles(req, res) {
    try {
        const { category, tag, search, page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));
        const offset = (pageNum - 1) * limitNum;
        let query = (0, database_1.default)("blog_articles as a")
            .select("a.*", "c.slug as category_slug", "c.name_en as category_name_en", "c.name_uz as category_name_uz")
            .leftJoin("categories as c", "a.category_id", "c.id")
            .where("a.is_published", true);
        if (category) {
            query = query.where("c.slug", category);
        }
        if (tag) {
            query = query.whereExists(function () {
                this.select("*")
                    .from("blog_article_tags as at")
                    .join("tags as t", "at.tag_id", "t.id")
                    .whereRaw("at.article_id = a.id")
                    .where("t.name", tag);
            });
        }
        if (search) {
            const searchStr = `%${search.toLowerCase()}%`;
            query = query.where((builder) => {
                builder.whereRaw("LOWER(a.title_en) LIKE ?", [searchStr])
                    .orWhereRaw("LOWER(a.title_uz) LIKE ?", [searchStr])
                    .orWhereRaw("LOWER(a.title_ru) LIKE ?", [searchStr])
                    .orWhereRaw("LOWER(a.content_en) LIKE ?", [searchStr])
                    .orWhereRaw("LOWER(a.content_uz) LIKE ?", [searchStr])
                    .orWhereRaw("LOWER(a.content_ru) LIKE ?", [searchStr]);
            });
        }
        // Clone query to count total matching items
        const countQuery = database_1.default.select(database_1.default.raw("count(*) as total")).from(query.clone().as("sub"));
        const [countResult] = (await countQuery);
        const total = Number(countResult?.total || 0);
        const articles = await query
            .orderBy("a.published_at", "desc")
            .limit(limitNum)
            .offset(offset);
        // Hydrate articles with tags
        const hydrated = await Promise.all(articles.map(async (art) => {
            const artTags = await (0, database_1.default)("tags as t")
                .select("t.id", "t.name")
                .join("blog_article_tags as at", "at.tag_id", "t.id")
                .where("at.article_id", art.id);
            return {
                ...art,
                tags: artTags
            };
        }));
        return (0, response_1.sendSuccess)(res, hydrated, "Articles loaded successfully.", 200, {
            total,
            page: pageNum,
            limit: limitNum
        });
    }
    catch (error) {
        console.error("Get Articles Error:", error);
        return (0, response_1.sendError)(res, "Failed to load blog articles.", 500);
    }
}
async function getArticleBySlug(req, res) {
    try {
        const { slug } = req.params;
        const article = await (0, database_1.default)("blog_articles as a")
            .select("a.*", "c.slug as category_slug", "c.name_en as category_name_en", "c.name_uz as category_name_uz")
            .leftJoin("categories as c", "a.category_id", "c.id")
            .where("a.slug", slug)
            .first();
        if (!article) {
            return (0, response_1.sendError)(res, "Blog article not found.", 404);
        }
        // Increment views asynchronously
        await (0, database_1.default)("blog_articles").where({ id: article.id }).increment("views_count", 1);
        article.views_count += 1;
        // Load related tags
        const tags = await (0, database_1.default)("tags as t")
            .select("t.id", "t.name")
            .join("blog_article_tags as at", "at.tag_id", "t.id")
            .where("at.article_id", article.id);
        return (0, response_1.sendSuccess)(res, {
            ...article,
            tags
        }, "Article loaded.");
    }
    catch (error) {
        console.error("Get Article Error:", error);
        return (0, response_1.sendError)(res, "Failed to load blog article.", 500);
    }
}
async function getCategories(req, res) {
    try {
        const categories = await (0, database_1.default)("categories").orderBy("name_en", "asc");
        return (0, response_1.sendSuccess)(res, categories);
    }
    catch (error) {
        console.error("Get Categories Error:", error);
        return (0, response_1.sendError)(res, "Failed to load categories.", 500);
    }
}
async function getTags(req, res) {
    try {
        const tags = await (0, database_1.default)("tags").orderBy("name", "asc");
        return (0, response_1.sendSuccess)(res, tags);
    }
    catch (error) {
        console.error("Get Tags Error:", error);
        return (0, response_1.sendError)(res, "Failed to load tags.", 500);
    }
}
