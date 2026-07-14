"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.refreshToken = refreshToken;
exports.me = me;
exports.updateProfile = updateProfile;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../../config/database"));
const response_1 = require("../../utils/response");
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_access_token_key_12345";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super_secret_refresh_token_key_67890";
function generateTokens(user) {
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}
async function register(req, res) {
    try {
        const { email, password, full_name } = req.body;
        if (!email || !password) {
            return (0, response_1.sendError)(res, "Email and password are required.", 400);
        }
        const existingUser = await (0, database_1.default)("users").where({ email }).first();
        if (existingUser) {
            return (0, response_1.sendError)(res, "Email is already registered.", 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const userId = (0, uuid_1.v4)();
        const newUser = {
            id: userId,
            email,
            password_hash: passwordHash,
            full_name: full_name || null,
            role: "user", // default role
            is_active: true,
            preferred_language: "uz",
            theme_preference: "dark"
        };
        await (0, database_1.default)("users").insert(newUser);
        // Track Audit Log
        await (0, database_1.default)("audit_logs").insert({
            id: (0, uuid_1.v4)(),
            user_id: userId,
            action: "USER_REGISTER",
            ip_address: req.ip || null,
            user_agent: req.headers["user-agent"] || null,
            payload: JSON.stringify({ email })
        });
        const { accessToken, refreshToken } = generateTokens({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        return (0, response_1.sendSuccess)(res, {
            user: {
                id: newUser.id,
                email: newUser.email,
                full_name: newUser.full_name,
                role: newUser.role,
                avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${newUser.id}`
            },
            accessToken
        }, "Registration successful.", 201);
    }
    catch (error) {
        console.error("Register Error:", error);
        return (0, response_1.sendError)(res, "An error occurred during registration.", 500);
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return (0, response_1.sendError)(res, "Email and password are required.", 400);
        }
        const user = await (0, database_1.default)("users").where({ email }).first();
        if (!user) {
            return (0, response_1.sendError)(res, "Invalid email or password.", 401);
        }
        if (!user.is_active) {
            return (0, response_1.sendError)(res, "Account is disabled. Please contact support.", 403);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return (0, response_1.sendError)(res, "Invalid email or password.", 401);
        }
        const { accessToken, refreshToken } = generateTokens({
            id: user.id,
            email: user.email,
            role: user.role
        });
        // Track Audit Log
        await (0, database_1.default)("audit_logs").insert({
            id: (0, uuid_1.v4)(),
            user_id: user.id,
            action: "USER_LOGIN",
            ip_address: req.ip || null,
            user_agent: req.headers["user-agent"] || null
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        return (0, response_1.sendSuccess)(res, {
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
            },
            accessToken
        }, "Login successful.");
    }
    catch (error) {
        console.error("Login Error:", error);
        return (0, response_1.sendError)(res, "An error occurred during login.", 500);
    }
}
async function logout(req, res) {
    try {
        if (req.user) {
            await (0, database_1.default)("audit_logs").insert({
                id: (0, uuid_1.v4)(),
                user_id: req.user.id,
                action: "USER_LOGOUT",
                ip_address: req.ip || null,
                user_agent: req.headers["user-agent"] || null
            });
        }
        res.clearCookie("refreshToken");
        return (0, response_1.sendSuccess)(res, {}, "Logged out successfully.");
    }
    catch (error) {
        console.error("Logout Error:", error);
        return (0, response_1.sendError)(res, "An error occurred during logout.", 500);
    }
}
async function refreshToken(req, res) {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;
        if (!token) {
            return (0, response_1.sendError)(res, "Refresh token is missing.", 401);
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        }
        catch (e) {
            return (0, response_1.sendError)(res, "Invalid or expired refresh token.", 403);
        }
        const user = await (0, database_1.default)("users").where({ id: decoded.id }).first();
        if (!user || !user.is_active) {
            return (0, response_1.sendError)(res, "User is inactive or not found.", 403);
        }
        const { accessToken, refreshToken: newRefreshToken } = generateTokens({
            id: user.id,
            email: user.email,
            role: user.role
        });
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return (0, response_1.sendSuccess)(res, {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
            }
        }, "Token refreshed successfully.");
    }
    catch (error) {
        console.error("Refresh Token Error:", error);
        return (0, response_1.sendError)(res, "An error occurred while refreshing token.", 500);
    }
}
async function me(req, res) {
    try {
        if (!req.user) {
            return (0, response_1.sendError)(res, "Not authenticated", 401);
        }
        const user = await (0, database_1.default)("users").where({ id: req.user.id }).first();
        if (!user) {
            return (0, response_1.sendError)(res, "User not found", 404);
        }
        return (0, response_1.sendSuccess)(res, {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
            preferred_language: user.preferred_language,
            theme_preference: user.theme_preference
        });
    }
    catch (error) {
        console.error("Fetch Me Error:", error);
        return (0, response_1.sendError)(res, "An error occurred while fetching user profile.", 500);
    }
}
async function updateProfile(req, res) {
    try {
        if (!req.user) {
            return (0, response_1.sendError)(res, "Not authenticated", 401);
        }
        const { full_name, preferred_language, theme_preference } = req.body;
        const updateData = {};
        if (full_name !== undefined)
            updateData.full_name = full_name;
        if (preferred_language !== undefined)
            updateData.preferred_language = preferred_language;
        if (theme_preference !== undefined)
            updateData.theme_preference = theme_preference;
        updateData.updated_at = database_1.default.fn.now();
        await (0, database_1.default)("users").where({ id: req.user.id }).update(updateData);
        return (0, response_1.sendSuccess)(res, {}, "Profile updated successfully.");
    }
    catch (error) {
        console.error("Update Profile Error:", error);
        return (0, response_1.sendError)(res, "An error occurred while updating profile.", 500);
    }
}
