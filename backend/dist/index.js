"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
// Initialize environment variables before importing configs
dotenv_1.default.config();
const migrate_1 = require("./database/migrate");
const seed_1 = require("./database/seed");
const errorHandler_1 = require("./middlewares/errorHandler");
// Import Route Handlers
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const tools_routes_1 = __importDefault(require("./modules/tools/tools.routes"));
const roadmaps_routes_1 = __importDefault(require("./modules/roadmaps/roadmaps.routes"));
const startup_routes_1 = __importDefault(require("./modules/startup-validation/startup.routes"));
const playground_routes_1 = __importDefault(require("./modules/playground/playground.routes"));
const blog_routes_1 = __importDefault(require("./modules/blog/blog.routes"));
const comments_routes_1 = __importDefault(require("./modules/comments/comments.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const corsOriginChecker = (origin, callback) => {
    if (!origin)
        return callback(null, true);
    const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
    if (isLocalhost || origin === process.env.APP_URL) {
        callback(null, true);
    }
    else {
        callback(new Error('Not allowed by CORS'));
    }
};
const io = new socket_io_1.Server(server, {
    cors: {
        origin: corsOriginChecker,
        credentials: true
    }
});
const PORT = process.env.PORT || 3000;
// Apply Security and Request Parsing middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false // for loading assets locally in dev
}));
app.use((0, cors_1.default)({
    origin: corsOriginChecker,
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Express session cookies parser helper
const cookieParser = require("cookie-parser");
app.use(cookieParser());
// Base Health Check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});
// Mount Routes
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/users", users_routes_1.default);
app.use("/api/v1/tools", tools_routes_1.default);
app.use("/api/v1/roadmaps", roadmaps_routes_1.default);
app.use("/api/v1/startup-validation", startup_routes_1.default);
app.use("/api/v1/playground", playground_routes_1.default);
app.use("/api/v1/blog", blog_routes_1.default);
app.use("/api/v1/comments", comments_routes_1.default);
app.use("/api/v1/admin", admin_routes_1.default);
// Apply Global Error Handler
app.use(errorHandler_1.errorHandler);
// WebSocket real-time namespace
const realtimeNamespace = io.of("/realtime");
let currentLiveViewers = 12; // Base live mock count
realtimeNamespace.on("connection", (socket) => {
    currentLiveViewers++;
    realtimeNamespace.emit("active:viewers", { count: currentLiveViewers });
    socket.on("subscribe:job", (data) => {
        // Simulate background worker progress ticks for roadmaps or validations
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            socket.emit(`job:progress:${data.jobId}`, { progress });
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 1000);
    });
    socket.on("disconnect", () => {
        currentLiveViewers = Math.max(1, currentLiveViewers - 1);
        realtimeNamespace.emit("active:viewers", { count: currentLiveViewers });
    });
});
// Bootstrap database and start listening
async function bootstrap() {
    try {
        // Run schema migrations
        await (0, migrate_1.runMigrations)();
        // Populate base records
        await (0, seed_1.runSeeds)();
        server.listen(PORT, () => {
            console.log(`[Server] AzamjonBro API running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
        });
    }
    catch (error) {
        console.error("[Bootstrap] Database connection or initialization failed:", error);
        process.exit(1);
    }
}
bootstrap();
