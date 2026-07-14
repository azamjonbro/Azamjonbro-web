"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIdea = validateIdea;
exports.getValidationByToken = getValidationByToken;
exports.getSavedValidations = getSavedValidations;
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const database_1 = __importDefault(require("../../config/database"));
const response_1 = require("../../utils/response");
// Heuristic fallback report generators
function generateMockValidationReport(idea) {
    const lowercaseIdea = idea.toLowerCase();
    let industry = "SaaS Platform";
    let techStack = "Vue 3, Node.js/Express, PostgreSQL, Redis, Docker";
    let MVPfeatures = ["User signup & onboarding dashboards", "Payment system integration (Stripe)", "Core analytics tracking database"];
    let monetization = "SaaS monthly subscription plans & Pay-per-use APIs";
    if (lowercaseIdea.includes("delivery") || lowercaseIdea.includes("food") || lowercaseIdea.includes("courier")) {
        industry = "On-demand Logistics & Delivery Service";
        techStack = "React Native, Node.js, WebSockets, PostgreSQL, Google Maps API";
        MVPfeatures = ["Real-time driver GPS tracking", "Vendor item management console", "Secure stripe processing payments"];
        monetization = "10% order commission fee + flat delivery base charges";
    }
    else if (lowercaseIdea.includes("crypto") || lowercaseIdea.includes("web3") || lowercaseIdea.includes("blockchain")) {
        industry = "Decentralized Finance / Web3 Tech";
        techStack = "Vue 3, Solidity, Ethers.js, Hardhat, IPFS storage nodes";
        MVPfeatures = ["MetaMask wallet connection hook", "Token balance dashboard tracker", "Smart contract integration audits"];
        monetization = "0.5% smart contract transaction exchange commission fees";
    }
    else if (lowercaseIdea.includes("ai") || lowercaseIdea.includes("bot") || lowercaseIdea.includes("intelligence")) {
        industry = "Artificial Intelligence Integrations";
        techStack = "Nuxt 3, FastAPI, Python, PostgreSQL, OpenAI API SDKs";
        MVPfeatures = ["Custom prompt builder dashboard", "API key vault encryption settings", "Token usage quota analytics charts"];
        monetization = "Tiered subscriptions (Standard: $19/mo, Pro: $49/mo)";
    }
    return {
        summary: `Validation assessment for "${idea.slice(0, 40)}..."`,
        industry,
        swot: {
            strengths: ["Highly scalable digital business model", "Relatively low initial development overheads", "Provides automated services saving manual times"],
            weaknesses: ["Requires significant initial marketing outreach to capture users", "Relies heavily on third-party cloud hosting infrastructure", "Potential technical complex data processing rules"],
            opportunities: ["Rapid expansion into emerging regional markets", "Integration of AI personalization features", "Partnerships with existing enterprise SaaS operators"],
            threats: ["Low entry barrier for quick copycat competitors", "Changing regulatory frameworks regarding data privacy", "Rapid technological obsolescence of specific APIs"]
        },
        marketSize: {
            TAM: "Estimated $1.2B global annual industry market size.",
            SAM: "Target region addressable market valued at $45M.",
            SOM: "Initial year target market share goal of $1.5M."
        },
        targetUsers: ["Early-adopter tech professionals", "Freelance developer operators", "Small-to-medium business administrators"],
        competitors: [
            { name: "Industry Leaders", pros: "High brand recognition, large features library", cons: "Expensive corporate pricing, slow customer support loops" },
            { name: "Niche Startups", pros: "Agile feature releases, focused user flows", cons: "Unstable long-term funding, limited advanced modules" }
        ],
        mvpScope: MVPfeatures,
        monetization: [monetization, "Affiliate referrals and premium service add-ons"],
        techRecommendation: techStack,
        developmentRoadmap: [
            { phase: "Weeks 1-4", focus: "Develop relational DB models, secure authentication modules, and main API controllers." },
            { phase: "Weeks 5-8", focus: "Build responsive client dashboard templates, connect external APIs, and run beta feedback groups." },
            { phase: "Weeks 9-10", focus: "Secure deployments, set up rate limits, launch SEO pages, and release publicly." }
        ]
    };
}
async function validateIdea(req, res) {
    try {
        const { idea_description } = req.body;
        if (!idea_description || idea_description.trim().length < 10) {
            return (0, response_1.sendError)(res, "Idea description must be at least 10 characters long.", 400);
        }
        const shareToken = (0, uuid_1.v4)().replace(/-/g, "").slice(0, 16);
        let validationReport = null;
        // Call OpenAI/Gemini if configured
        const hasAI = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
        if (hasAI) {
            try {
                const apiKey = process.env.OPENAI_API_KEY;
                const response = await axios_1.default.post("https://api.openai.com/v1/chat/completions", {
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are a professional venture capital advisor and business developer. Evaluate the user's startup idea. Provide a detailed SWOT, Market size estimates (TAM, SAM, SOM), target users, major competitors, MVP Scope, monetization plans, and a tech stack recommendations. Output purely valid JSON conforming to the requested structure."
                        },
                        {
                            role: "user",
                            content: `Evaluate the following startup concept: "${idea_description}"`
                        }
                    ],
                    response_format: { type: "json_object" }
                }, {
                    headers: { Authorization: `Bearer ${apiKey}` }
                });
                validationReport = JSON.parse(response.data.choices[0].message.content);
            }
            catch (err) {
                console.warn("AI generation for startup failed. Using heuristic generator.", err.message);
            }
        }
        if (!validationReport) {
            validationReport = generateMockValidationReport(idea_description);
        }
        // Save to DB
        const validationId = (0, uuid_1.v4)();
        await (0, database_1.default)("startup_validations").insert({
            id: validationId,
            user_id: req.user ? req.user.id : null,
            share_token: shareToken,
            idea_description,
            validation_report: JSON.stringify(validationReport),
            created_at: database_1.default.fn.now()
        });
        return (0, response_1.sendSuccess)(res, {
            id: validationId,
            shareToken,
            idea_description,
            validation_report: validationReport
        }, "Startup idea validated successfully.");
    }
    catch (error) {
        console.error("Validate Idea Error:", error);
        return (0, response_1.sendError)(res, "Failed to analyze startup validation.", 500);
    }
}
async function getValidationByToken(req, res) {
    try {
        const { token } = req.params;
        const validation = await (0, database_1.default)("startup_validations").where({ share_token: token }).first();
        if (!validation) {
            return (0, response_1.sendError)(res, "Validation report not found.", 404);
        }
        return (0, response_1.sendSuccess)(res, {
            id: validation.id,
            share_token: validation.share_token,
            idea_description: validation.idea_description,
            validation_report: JSON.parse(validation.validation_report),
            created_at: validation.created_at
        });
    }
    catch (error) {
        console.error("Get Validation Error:", error);
        return (0, response_1.sendError)(res, "Failed to retrieve validation details.", 500);
    }
}
async function getSavedValidations(req, res) {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, "Unauthorized", 401);
        const validations = await (0, database_1.default)("startup_validations")
            .where({ user_id: req.user.id })
            .orderBy("created_at", "desc");
        const hydrated = validations.map(v => ({
            ...v,
            validation_report: JSON.parse(v.validation_report)
        }));
        return (0, response_1.sendSuccess)(res, hydrated);
    }
    catch (error) {
        console.error("Get Saved Validations Error:", error);
        return (0, response_1.sendError)(res, "Failed to load saved validation reports.", 500);
    }
}
