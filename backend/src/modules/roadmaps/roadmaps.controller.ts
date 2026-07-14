import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import db from "../../config/database";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthenticatedRequest } from "../../middlewares/auth";

// Heuristic fallback roadmaps in case AI is not configured
const MOCK_ROADMAPS: Record<string, Array<{ month: string; title: string; topics: string[]; project: { name: string; desc: string }; interviewPrep: string[] }>> = {
  frontend: [
    {
      month: "Month 1",
      title: "Core Mechanics & Modern UI Layouts",
      topics: ["Semantic HTML5 & Accessibility (a11y)", "CSS3 Flexbox, Grid layouts & custom variables", "Git version control and collaborative workflows"],
      project: { name: "Interactive CSS Dashboard", desc: "Build a responsive grid-based operations control layout with dynamic theme preferences using purely CSS Custom Properties." },
      interviewPrep: ["Explain the difference between block, inline, and inline-block layout behaviors.", "What is specificity in CSS and how is it calculated?", "Explain semantic HTML tags and why they matter for SEO."]
    },
    {
      month: "Month 2",
      title: "Advanced JavaScript & Frontend Foundations",
      topics: ["Asynchronous JS (Promises, async/await, event loop)", "ES6+ array utilities, destructuring, and imports", "DOM manipulation principles and event delegation patterns"],
      project: { name: "Real-time Crypto Tracker", desc: "A client-side vanilla JavaScript app fetching active crypto pricing tickers from a public API, rendering data updates dynamically." },
      interviewPrep: ["What is a closure in JavaScript? Provide a real-world example.", "Explain the difference between event bubbling and event capturing.", "What is the JS Event Loop and how does it manage the call stack?"]
    },
    {
      month: "Month 3",
      title: "Vue 3 Component Framework & Architecture",
      topics: ["Vue 3 Composition API & reactive primitives (ref, reactive, computed)", "Vue Router integration & path authentication guards", "Pinia state management, store actions & mutations"],
      project: { name: "AzamjonBro Lab clone Dashboard", desc: "A modular, component-driven dashboard utilizing TailwindCSS styling, reactive analytics state, and localized i18n translation systems." },
      interviewPrep: ["What is the difference between ref and reactive in Vue 3?", "How does computed differ from watch, and when should you use each?", "Explain how route guards work in Vue Router."]
    }
  ],
  backend: [
    {
      month: "Month 1",
      title: "Server Mechanics & HTTP APIs",
      topics: ["Node.js event-driven architecture & cluster mechanisms", "Express.js route routers, response serialization, and status routing", "Middlewares (CORS, body parser, helmet integration)"],
      project: { name: "RESTful Task Management Engine", desc: "Build a secure REST API containing JWT authorization, input body validation, and structured JSON output wrappers." },
      interviewPrep: ["What is the event loop in Node.js, and how does it make asynchronous I/O possible?", "Explain difference between REST, GraphQL, and RPC APIs.", "How does Express middleware chain pass execution control?"]
    },
    {
      month: "Month 2",
      title: "Databases, Relational Schema & ORMs",
      topics: ["PostgreSQL schema normalization & custom indexes", "Knex.js migrations, query builders, transactions", "SQL injection vulnerabilities and prevention strategies"],
      project: { name: "E-Commerce Database Backbone", desc: "Develop a relational database model mapping inventory, user registers, and secure checkout orders including transactional queries." },
      interviewPrep: ["Explain differences between inner, left, right, and full outer joins.", "What are database transactions? Explain ACID properties.", "What is an index, and how does it accelerate database queries?"]
    },
    {
      month: "Month 3",
      title: "Background Workers, Caching & Real-time Sockets",
      topics: ["Redis key-value datastores for session caching & blacklist records", "BullMQ background queues for heavy asynchronous tasks", "Socket.IO for persistent real-time bi-directional client channels"],
      project: { name: "Real-time Notifications Broker", desc: "Create a backend system that queues bulky email dispatches in background BullMQ processes while publishing real-time user browser notifications via sockets." },
      interviewPrep: ["Why do we use caching? Explain caching write policies (e.g. Cache-Aside).", "How do task queues like BullMQ improve server response speeds?", "What is the WebSocket protocol and how does it establish connections?"]
    }
  ]
};

export async function generateRoadmap(req: AuthenticatedRequest, res: Response) {
  try {
    const { current_skills, desired_role, time_available, experience_level } = req.body;

    if (!desired_role || !current_skills) {
      return sendError(res, "Skills and Desired Role are required.", 400);
    }

    const shareToken = uuidv4().replace(/-/g, "").slice(0, 16);
    let roadmapData: any = null;

    // Call AI if credentials exist, otherwise build heuristic roadmap
    const hasAI = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (hasAI) {
      try {
        const apiKey = process.env.OPENAI_API_KEY;
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert AI software architect. Generate a highly detailed, professional, month-by-month developer learning roadmap. Output purely valid JSON, matching this structure: [ { \"month\": \"Month 1\", \"title\": \"Month title\", \"topics\": [\"topic1\"], \"project\": { \"name\": \"P1\", \"desc\": \"Desc\" }, \"interviewPrep\": [\"q1\"] } ]"
            },
            {
              role: "user",
              content: `Generate a roadmap for:
Desired Role: ${desired_role}
Current Skills: ${current_skills}
Available Time: ${time_available || "10 hours/week"}
Experience Level: ${experience_level || "beginner"}`
            }
          ],
          response_format: { type: "json_object" }
        }, {
          headers: { Authorization: `Bearer ${apiKey}` }
        });

        const parsed = JSON.parse(response.data.choices[0].message.content);
        roadmapData = parsed.roadmap || parsed;
      } catch (err: any) {
        console.warn("AI generation failed or timeout. Falling back to heuristic engine.", err.message);
      }
    }

    // Heuristic generator if AI was skipped or failed
    if (!roadmapData) {
      const normalizedRole = desired_role.toLowerCase();
      if (normalizedRole.includes("back") || normalizedRole.includes("node") || normalizedRole.includes("api")) {
        roadmapData = MOCK_ROADMAPS.backend;
      } else {
        // Default to frontend structure
        roadmapData = MOCK_ROADMAPS.frontend;
      }
    }

    // Save to DB
    const roadmapId = uuidv4();
    await db("saved_roadmaps").insert({
      id: roadmapId,
      user_id: req.user ? req.user.id : null,
      share_token: shareToken,
      current_skills,
      desired_role,
      time_available: time_available || "10 hours/week",
      experience_level: experience_level || "beginner",
      roadmap_data: JSON.stringify(roadmapData),
      created_at: db.fn.now()
    });

    return sendSuccess(res, {
      id: roadmapId,
      shareToken,
      desired_role,
      roadmap_data: roadmapData
    }, "Roadmap generated successfully.");
  } catch (error) {
    console.error("Generate Roadmap Error:", error);
    return sendError(res, "Failed to generate learning roadmap.", 500);
  }
}

export async function getRoadmapByToken(req: Request, res: Response) {
  try {
    const { token } = req.params;

    const roadmap = await db("saved_roadmaps").where({ share_token: token }).first();
    if (!roadmap) {
      return sendError(res, "Roadmap not found.", 404);
    }

    return sendSuccess(res, {
      id: roadmap.id,
      share_token: roadmap.share_token,
      desired_role: roadmap.desired_role,
      current_skills: roadmap.current_skills,
      time_available: roadmap.time_available,
      experience_level: roadmap.experience_level,
      roadmap_data: JSON.parse(roadmap.roadmap_data),
      created_at: roadmap.created_at
    });
  } catch (error) {
    console.error("Get Roadmap Error:", error);
    return sendError(res, "Failed to retrieve roadmap details.", 500);
  }
}

export async function getSavedRoadmaps(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, "Unauthorized", 401);

    const roadmaps = await db("saved_roadmaps")
      .where({ user_id: req.user.id })
      .orderBy("created_at", "desc");

    const hydrated = roadmaps.map(r => ({
      ...r,
      roadmap_data: JSON.parse(r.roadmap_data)
    }));

    return sendSuccess(res, hydrated);
  } catch (error) {
    console.error("Get Saved Roadmaps Error:", error);
    return sendError(res, "Failed to fetch user roadmaps.", 500);
  }
}

export async function exportPdf(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const roadmap = await db("saved_roadmaps").where({ share_token: token }).first();
    if (!roadmap) return sendError(res, "Roadmap not found", 404);

    // Simple plain text JSON file attachment for downloading
    res.setHeader("Content-disposition", `attachment; filename=roadmap-${token}.json`);
    res.setHeader("Content-type", "application/json");
    return res.send(JSON.stringify(JSON.parse(roadmap.roadmap_data), null, 2));
  } catch (error) {
    console.error("Export PDF Error:", error);
    return sendError(res, "Failed to export roadmap file.", 500);
  }
}
