import db from "../config/database";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function runSeeds() {
  console.log("[DB Seed] Starting database seeding...");

  try {
    // 1. Seed Admin User
    const adminEmail = "admin@azamjonbro.uz";
    const existingAdmin = await db("users").where({ email: adminEmail }).first();
    let adminId = uuidv4();

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("admin123", 10);
      await db("users").insert({
        id: adminId,
        email: adminEmail,
        password_hash: passwordHash,
        full_name: "AzamjonBro (Admin)",
        role: "admin",
        avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
        is_active: true,
        preferred_language: "en",
        theme_preference: "dark",
        email_verified_at: db.fn.now()
      });
      console.log("[DB Seed] Seeded admin user (email: admin@azamjonbro.uz / password: admin123)");
    } else {
      adminId = existingAdmin.id;
      console.log("[DB Seed] Admin user already exists");
    }

    // 2. Seed Categories
    const categories = [
      { id: uuidv4(), slug: "frontend", name_uz: "Frontend Dasturlash", name_en: "Frontend Development", name_ru: "Frontend Разработка" },
      { id: uuidv4(), slug: "backend", name_uz: "Backend Dasturlash", name_en: "Backend Development", name_ru: "Backend Разработка" },
      { id: uuidv4(), slug: "system-design", name_uz: "Tizim Dizayni", name_en: "System Design", name_ru: "Системный Дизайн" },
      { id: uuidv4(), slug: "cybersecurity", name_uz: "Kiberxavfsizlik", name_en: "Cybersecurity", name_ru: "Кибербезопасность" },
      { id: uuidv4(), slug: "devops", name_uz: "DevOps va Bulutlar", name_en: "DevOps & Cloud", name_ru: "DevOps и Облака" }
    ];

    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
      const existing = await db("categories").where({ slug: cat.slug }).first();
      if (!existing) {
        await db("categories").insert(cat);
        categoryMap[cat.slug] = cat.id;
      } else {
        categoryMap[cat.slug] = existing.id;
      }
    }
    console.log("[DB Seed] Seeded blog categories");

    // 3. Seed Tags
    const tags = [
      { id: uuidv4(), name: "vue" },
      { id: uuidv4(), name: "react" },
      { id: uuidv4(), name: "nodejs" },
      { id: uuidv4(), name: "express" },
      { id: uuidv4(), name: "postgresql" },
      { id: uuidv4(), name: "docker" },
      { id: uuidv4(), name: "linux" },
      { id: uuidv4(), name: "nginx" },
      { id: uuidv4(), name: "security" },
      { id: uuidv4(), name: "jwt" }
    ];

    const tagMap: Record<string, string> = {};
    for (const tag of tags) {
      const existing = await db("tags").where({ name: tag.name }).first();
      if (!existing) {
        await db("tags").insert(tag);
        tagMap[tag.name] = tag.id;
      } else {
        tagMap[tag.name] = existing.id;
      }
    }
    console.log("[DB Seed] Seeded tags");

    // 4. Seed Articles
    const articles = [
      {
        id: uuidv4(),
        slug: "vue-3-composition-api-architecture",
        category_id: categoryMap["frontend"],
        title_uz: "Vue 3 Composition API: Premium Arxitektura Qo'llanmasi",
        title_en: "Vue 3 Composition API: Premium Architecture Guide",
        title_ru: "Vue 3 Composition API: Руководство по премиум архитектуре",
        content_uz: `### Kirish
Vue 3 Composition API yordamida loyiha tuzilishini optimal va premium qilish mumkin. Ushbu maqolada features-based arxitektura, reusable composables va render samaradorligini tahlil qilamiz.

### Production Maslahati
Har doim reactive o'zgaruvchilarni \`shallowRef\` yoki \`computed\` orqali optimallashtiring. Keraksiz re-rendering oldini olish uchun \`v-once\` va \`v-memo\` dan foydalaning.

\`\`\`typescript
import { ref, computed } from 'vue';

export function useCounter() {
  const count = ref(0);
  const double = computed(() => count.value * 2);
  const increment = () => count.value++;
  return { count, double, increment };
}
\`\`\`
`,
        content_en: `### Introduction
With Vue 3 Composition API, project structure can be made highly scalable. In this guide, we analyze feature-based structures, reusable composables, and rendering performance.

### Production Advice
Always optimize reactive structures using \`shallowRef\` or \`computed\` wrappers. To prevent wasteful re-render passes, utilize Vue's built-in \`v-once\` and \`v-memo\` directives.

\`\`\`typescript
import { ref, computed } from 'vue';

export function useCounter() {
  const count = ref(0);
  const double = computed(() => count.value * 2);
  const increment = () => count.value++;
  return { count, double, increment };
}
\`\`\`
`,
        content_ru: `### Введение
С помощью Vue 3 Composition API структура проекта становится расширяемой. В этом руководстве мы проанализируем структуры, ориентированные на фичи, переиспользуемые composables и производительность рендеринга.

### Производственный совет
Всегда оптимизируйте реактивные переменные с помощью \`shallowRef\` или \`computed\`. Для предотвращения лишних отрисовок используйте директивы \`v-once\` и \`v-memo\`.

\`\`\`typescript
import { ref, computed } from 'vue';

export function useCounter() {
  const count = ref(0);
  const double = computed(() => count.value * 2);
  const increment = () => count.value++;
  return { count, double, increment };
}
\`\`\`
`,
        featured_image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80",
        author_name: "AzamjonBro",
        read_time_minutes: 6,
        is_published: true,
        published_at: new Date()
      },
      {
        id: uuidv4(),
        slug: "securing-node-express-apis",
        category_id: categoryMap["cybersecurity"],
        title_uz: "Node.js Express APIlarini Himoyalash: SQLi, XSS va JWT",
        title_en: "Securing Node.js Express APIs: SQLi, XSS, and JWT",
        title_ru: "Защита API на Node.js Express: SQLi, XSS и JWT",
        content_uz: `### API Xavfsizligi
Ushbu maqolada API tizimlarini qanday qilib SQL inyeksiya, cross-site scripting (XSS) va noto'g'ri JWT boshqaruvidan himoya qilishni ko'rib chiqamiz.

### Asosiy Qoidalar
1. **Input validation**: Har qanday kelayotgan request parametrlarini zosh yoki validator orqali tekshiring.
2. **Helmet**: HTTP header xavfsizlik sozlamalarini avtomatik faollashtiring.
3. **CORS Configuration**: Faqat ruxsat etilgan domenlarni CORS listiga qo'shing.

\`\`\`javascript
const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet());
\`\`\`
`,
        content_en: `### API Security
In this guide, we will analyze securing backend API applications against SQL injection (SQLi), Cross-Site Scripting (XSS), and flawed JWT configurations.

### Key Rules
1. **Input validation**: Sanitize and match incoming requests using schemas (e.g. zod).
2. **Helmet**: Inject security-oriented HTTP response headers.
3. **CORS Configuration**: Restrict origins to active deployments.

\`\`\`javascript
const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet());
\`\`\`
`,
        content_ru: `### Безопасность API
В этой статье мы рассмотрим, как защитить наши API-системы от SQL-инъекций, межсайтового скриптинга (XSS) и некорректного управления JWT.

### Ключевые Правила
1. **Валидация ввода**: Проверяйте входящие запросы с помощью схем валидации (например, zod).
2. **Helmet**: Автоматически настраивайте заголовки безопасности HTTP.
3. **CORS Configuration**: Ограничивайте доступ только разрешенным доменам.

\`\`\`javascript
const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet());
\`\`\`
`,
        featured_image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
        author_name: "AzamjonBro",
        read_time_minutes: 8,
        is_published: true,
        published_at: new Date()
      }
    ];

    for (const art of articles) {
      const existing = await db("blog_articles").where({ slug: art.slug }).first();
      if (!existing) {
        await db("blog_articles").insert(art);
        // Link tags
        const associatedTags = art.slug === "vue-3-composition-api-architecture" 
          ? [tagMap["vue"]] 
          : [tagMap["nodejs"], tagMap["express"], tagMap["security"], tagMap["jwt"]];
        
        for (const tid of associatedTags) {
          if (tid) {
            await db("blog_article_tags").insert({
              article_id: art.id,
              tag_id: tid
            });
          }
        }
      }
    }
    console.log("[DB Seed] Seeded blog articles & tag relations");

    console.log("[DB Seed] Database seeding completed successfully!");
  } catch (error) {
    console.error("[DB Seed] Seeding Error:", error);
    throw error;
  }
}
