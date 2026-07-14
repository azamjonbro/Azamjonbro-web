import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import db from "../../config/database";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthenticatedRequest } from "../../middlewares/auth";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_access_token_key_12345";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super_secret_refresh_token_key_67890";

function generateTokens(user: { id: string; email: string; role: string }) {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required.", 400);
    }

    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return sendError(res, "Email is already registered.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

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

    await db("users").insert(newUser);

    // Track Audit Log
    await db("audit_logs").insert({
      id: uuidv4(),
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

    return sendSuccess(res, {
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${newUser.id}`
      },
      accessToken
    }, "Registration successful.", 201);
  } catch (error) {
    console.error("Register Error:", error);
    return sendError(res, "An error occurred during registration.", 500);
  }
}

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required.", 400);
    }

    const user = await db("users").where({ email }).first();
    if (!user) {
      return sendError(res, "Invalid email or password.", 401);
    }

    if (!user.is_active) {
      return sendError(res, "Account is disabled. Please contact support.", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, "Invalid email or password.", 401);
    }

    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Track Audit Log
    await db("audit_logs").insert({
      id: uuidv4(),
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

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
      },
      accessToken
    }, "Login successful.");
  } catch (error) {
    console.error("Login Error:", error);
    return sendError(res, "An error occurred during login.", 500);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user) {
      await db("audit_logs").insert({
        id: uuidv4(),
        user_id: req.user.id,
        action: "USER_LOGOUT",
        ip_address: req.ip || null,
        user_agent: req.headers["user-agent"] || null
      });
    }

    res.clearCookie("refreshToken");
    return sendSuccess(res, {}, "Logged out successfully.");
  } catch (error) {
    console.error("Logout Error:", error);
    return sendError(res, "An error occurred during logout.", 500);
  }
}

export async function refreshToken(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) {
      return sendError(res, "Refresh token is missing.", 401);
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (e) {
      return sendError(res, "Invalid or expired refresh token.", 403);
    }

    const user = await db("users").where({ id: decoded.id }).first();
    if (!user || !user.is_active) {
      return sendError(res, "User is inactive or not found.", 403);
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

    return sendSuccess(res, {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
      }
    }, "Token refreshed successfully.");
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return sendError(res, "An error occurred while refreshing token.", 500);
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Not authenticated", 401);
    }
    const user = await db("users").where({ id: req.user.id }).first();
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
      preferred_language: user.preferred_language,
      theme_preference: user.theme_preference
    });
  } catch (error) {
    console.error("Fetch Me Error:", error);
    return sendError(res, "An error occurred while fetching user profile.", 500);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Not authenticated", 401);
    }

    const { full_name, preferred_language, theme_preference } = req.body;
    const updateData: any = {};

    if (full_name !== undefined) updateData.full_name = full_name;
    if (preferred_language !== undefined) updateData.preferred_language = preferred_language;
    if (theme_preference !== undefined) updateData.theme_preference = theme_preference;
    updateData.updated_at = db.fn.now();

    await db("users").where({ id: req.user.id }).update(updateData);

    return sendSuccess(res, {}, "Profile updated successfully.");
  } catch (error) {
    console.error("Update Profile Error:", error);
    return sendError(res, "An error occurred while updating profile.", 500);
  }
}
