import { Knex } from "knex";
import db from "../config/database";
import { v4 as uuidv4 } from "uuid";

export async function runMigrations() {
  console.log("[DB Migration] Starting migration check...");

  try {
    // 1. USERS TABLE
    const hasUsers = await db.schema.hasTable("users");
    if (!hasUsers) {
      await db.schema.createTable("users", (table) => {
        table.string("id", 36).primary();
        table.string("email").unique().notNullable();
        table.string("password_hash").notNullable();
        table.string("full_name").nullable();
        table.string("role").defaultTo("user"); // user, admin, guest
        table.string("avatar_url").nullable();
        table.boolean("is_active").defaultTo(true);
        table.string("preferred_language").defaultTo("uz");
        table.string("theme_preference").defaultTo("dark");
        table.timestamp("email_verified_at").nullable();
        table.timestamps(true, true);
      });
      console.log("[DB Migration] Created table: users");
    }

    // 2. CATEGORIES TABLE
    const hasCategories = await db.schema.hasTable("categories");
    if (!hasCategories) {
      await db.schema.createTable("categories", (table) => {
        table.string("id", 36).primary();
        table.string("slug").unique().notNullable();
        table.string("name_uz").notNullable();
        table.string("name_en").notNullable();
        table.string("name_ru").notNullable();
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
      console.log("[DB Migration] Created table: categories");
    }

    // 3. TAGS TABLE
    const hasTags = await db.schema.hasTable("tags");
    if (!hasTags) {
      await db.schema.createTable("tags", (table) => {
        table.string("id", 36).primary();
        table.string("name").unique().notNullable();
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
      console.log("[DB Migration] Created table: tags");
    }

    // 4. BLOG_ARTICLES TABLE
    const hasArticles = await db.schema.hasTable("blog_articles");
    if (!hasArticles) {
      await db.schema.createTable("blog_articles", (table) => {
        table.string("id", 36).primary();
        table.string("slug").unique().notNullable();
        table.string("category_id", 36).references("id").inTable("categories").onDelete("CASCADE");
        table.string("title_uz").notNullable();
        table.string("title_en").notNullable();
        table.string("title_ru").notNullable();
        table.text("content_uz").notNullable();
        table.text("content_en").notNullable();
        table.text("content_ru").notNullable();
        table.string("featured_image").nullable();
        table.string("author_name").defaultTo("AzamjonBro");
        table.integer("read_time_minutes").defaultTo(5);
        table.integer("views_count").defaultTo(0);
        table.boolean("is_published").defaultTo(false);
        table.timestamp("published_at").nullable();
        table.timestamps(true, true);
      });
      console.log("[DB Migration] Created table: blog_articles");
    }

    // 5. BLOG_ARTICLE_TAGS (M2M) TABLE
    const hasArticleTags = await db.schema.hasTable("blog_article_tags");
    if (!hasArticleTags) {
      await db.schema.createTable("blog_article_tags", (table) => {
        table.string("article_id", 36).references("id").inTable("blog_articles").onDelete("CASCADE");
        table.string("tag_id", 36).references("id").inTable("tags").onDelete("CASCADE");
        table.primary(["article_id", "tag_id"]);
      });
      console.log("[DB Migration] Created table: blog_article_tags");
    }

    // 6. COMMENTS TABLE
    const hasComments = await db.schema.hasTable("comments");
    if (!hasComments) {
      await db.schema.createTable("comments", (table) => {
        table.string("id", 36).primary();
        table.string("article_id", 36).references("id").inTable("blog_articles").onDelete("CASCADE");
        table.string("user_id", 36).references("id").inTable("users").onDelete("CASCADE");
        table.string("parent_id", 36).nullable().references("id").inTable("comments").onDelete("CASCADE");
        table.text("content").notNullable();
        table.boolean("is_approved").defaultTo(true);
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
      console.log("[DB Migration] Created table: comments");
    }

    // 7. TOOL_HISTORY TABLE
    const hasToolHistory = await db.schema.hasTable("tool_history");
    if (!hasToolHistory) {
      await db.schema.createTable("tool_history", (table) => {
        table.string("id", 36).primary();
        table.string("user_id", 36).nullable().references("id").inTable("users").onDelete("SET NULL");
        table.string("guest_fingerprint").index().notNullable();
        table.string("tool_type").notNullable();
        table.text("input_data").nullable();  // JSON string
        table.text("output_data").nullable(); // JSON string
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
      console.log("[DB Migration] Created table: tool_history");
    }

    // 8. SAVED_ROADMAPS TABLE
    const hasRoadmaps = await db.schema.hasTable("saved_roadmaps");
    if (!hasRoadmaps) {
      await db.schema.createTable("saved_roadmaps", (table) => {
        table.string("id", 36).primary();
        table.string("user_id", 36).nullable().references("id").inTable("users").onDelete("CASCADE");
        table.string("share_token").unique().notNullable();
        table.string("current_skills").notNullable();
        table.string("desired_role").notNullable();
        table.string("time_available").notNullable();
        table.string("experience_level").notNullable();
        table.text("roadmap_data").notNullable(); // JSON string
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
      console.log("[DB Migration] Created table: saved_roadmaps");
    }

    // 9. STARTUP_VALIDATIONS TABLE
    const hasValidations = await db.schema.hasTable("startup_validations");
    if (!hasValidations) {
      await db.schema.createTable("startup_validations", (table) => {
        table.string("id", 36).primary();
        table.string("user_id", 36).nullable().references("id").inTable("users").onDelete("CASCADE");
        table.string("share_token").unique().notNullable();
        table.text("idea_description").notNullable();
        table.text("validation_report").notNullable(); // JSON string
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
      console.log("[DB Migration] Created table: startup_validations");
    }

    // 10. USER_BOOKMARKS TABLE
    const hasBookmarks = await db.schema.hasTable("user_bookmarks");
    if (!hasBookmarks) {
      await db.schema.createTable("user_bookmarks", (table) => {
        table.string("id", 36).primary();
        table.string("user_id", 36).references("id").inTable("users").onDelete("CASCADE");
        table.string("bookmarkable_type").notNullable(); // article, roadmap, validation
        table.string("bookmarkable_id", 36).notNullable();
        table.timestamp("created_at").defaultTo(db.fn.now());
        table.unique(["user_id", "bookmarkable_type", "bookmarkable_id"]);
      });
      console.log("[DB Migration] Created table: user_bookmarks");
    }

    // 11. AUDIT_LOGS TABLE
    const hasAuditLogs = await db.schema.hasTable("audit_logs");
    if (!hasAuditLogs) {
      await db.schema.createTable("audit_logs", (table) => {
        table.string("id", 36).primary();
        table.string("user_id", 36).nullable().references("id").inTable("users").onDelete("SET NULL");
        table.string("action").notNullable();
        table.string("ip_address").nullable();
        table.string("user_agent").nullable();
        table.text("payload").nullable(); // JSON string
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
      console.log("[DB Migration] Created table: audit_logs");
    }

    console.log("[DB Migration] All migrations completed successfully!");
  } catch (error) {
    console.error("[DB Migration] Fatal Migration Error:", error);
    throw error;
  }
}
