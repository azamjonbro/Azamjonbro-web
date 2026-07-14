import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendSuccess, sendError } from "../../utils/response";

export async function simulateSql(req: Request, res: Response) {
  try {
    const { query } = req.body;
    if (!query) return sendError(res, "SQL query payload is required.", 400);

    const lowercase = query.toLowerCase();
    let isVulnerable = false;
    let explanation = "";
    let data: any[] = [];

    // Simulate SQL Injection checks
    if (lowercase.includes("' or '1'='1") || lowercase.includes("' or 1=1") || lowercase.includes("or true") || lowercase.includes("union select")) {
      isVulnerable = true;
      explanation = "SQL Injection Successful! By inputting `' OR '1'='1`, you modified the query structure so the WHERE clause always evaluates to TRUE. The database returned all user records without checking passwords.";
      data = [
        { id: "1", email: "admin@azamjonbro.uz", role: "admin", credit_card: "4111-2222-3333-4444" },
        { id: "2", email: "student@dev.uz", role: "user", credit_card: "5300-1111-2222-3333" },
        { id: "3", email: "investor@startup.uz", role: "user", credit_card: "4000-1234-5678-9010" }
      ];
    } else if (lowercase.includes("select") && lowercase.includes("users")) {
      explanation = "Query executed safely, but query results were restricted to standard records since no injection bounds were triggered.";
      data = [
        { id: "2", email: "student@dev.uz", role: "user", credit_card: "REDACTED" }
      ];
    } else {
      explanation = "Query failed to parse. Try using standard SQL injection patterns like: SELECT * FROM users WHERE email = 'guest' OR '1'='1'";
      return sendSuccess(res, { isVulnerable, explanation, data: [] });
    }

    return sendSuccess(res, {
      isVulnerable,
      explanation,
      simulatedQuery: `SELECT * FROM users WHERE email = '${query}' AND is_active = true`,
      safeQuery: `SELECT * FROM users WHERE email = ? AND is_active = true  -- Bound parameter: "${query}"`,
      data
    });
  } catch (error) {
    console.error("SQLi Simulation Error:", error);
    return sendError(res, "SQL injection simulator encountered an error.", 500);
  }
}

export async function simulateXss(req: Request, res: Response) {
  try {
    const { payload } = req.body;
    if (!payload) return sendError(res, "XSS script payload is required.", 400);

    const containsScript = /<script\b[^>]*>([\s\S]*?)<\/script>/gi.test(payload) || 
                           /onerror\s*=/gi.test(payload) || 
                           /onload\s*=/gi.test(payload) || 
                           /javascript:/gi.test(payload);

    let explanation = "";
    if (containsScript) {
      explanation = "VULNERABILITY CONFIRMED: The input was outputted raw to the DOM. If a user visits this page, the script executes inside their browser session context, exposing cookies or local storage secrets.";
    } else {
      explanation = "Payload entered, but no executable script bounds were detected. Try entering payloads like: <script>alert(localStorage.getItem('token'))</script> or <img src=x onerror=alert('hack')>";
    }

    // Escape HTML to show safe rendering
    const escaped = payload
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    return sendSuccess(res, {
      isVulnerable: containsScript,
      escaped,
      explanation,
      mitigationCode: `<!-- INSECURE RENDERING -->\n<div v-html="userInput"></div>\n\n<!-- SECURE RENDERING (auto-escapes scripts) -->\n<div>{{ userInput }}</div>`
    });
  } catch (error) {
    console.error("XSS Simulation Error:", error);
    return sendError(res, "XSS simulator encountered an error.", 500);
  }
}

export async function runLinuxSandbox(req: Request, res: Response) {
  try {
    const { command } = req.body;
    if (!command) return sendError(res, "Command parameter is required.", 400);

    const parts = command.trim().split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    let output = "";

    switch (cmd) {
      case "help":
        output = "AzamjonBro Sandbox Shell, v1.0.0-beta\nAvailable commands:\n  help        Display this help text\n  ls          List files in current folder\n  cat [file]  Print file contents\n  whoami      Display current terminal user\n  pwd         Print working directory\n  ping [ip]   Simulate a network latency probe\n  clear       Reset terminal layout";
        break;
      case "ls":
        output = "configs.json    secret.txt    server.ts";
        break;
      case "pwd":
        output = "/var/www/azamjonbro-lab/sandbox";
        break;
      case "whoami":
        output = "guest_sandbox_developer";
        break;
      case "cat":
        if (!arg) {
          output = "cat: missing file argument. Usage: cat [filename]";
        } else if (arg === "secret.txt") {
          output = "FLAG{AZAMJON_CYBER_SEC_WARRIOR_2026}\nCongrats! You read the sandbox secret file.";
        } else if (arg === "configs.json") {
          output = JSON.stringify({ appName: "AzamjonBro Lab", version: "1.0.0", port: 3000, secureMode: true }, null, 2);
        } else if (arg === "server.ts") {
          output = "import express from 'express';\nconst app = express();\napp.listen(3000, () => console.log('Listening...'));";
        } else {
          output = `cat: ${arg}: No such file or directory. Try: cat secret.txt`;
        }
        break;
      case "ping":
        if (!arg) {
          output = "ping: missing target host address. Usage: ping google.com";
        } else {
          output = `PING ${arg} (142.250.72.238): 56 data bytes\n64 bytes from ${arg}: icmp_seq=0 ttl=116 time=14.2 ms\n64 bytes from ${arg}: icmp_seq=1 ttl=116 time=12.8 ms\n\n--- ${arg} ping statistics ---\n2 packets transmitted, 2 packets received, 0% packet loss\nrtt min/avg/max = 12.8/13.5/14.2 ms`;
        }
        break;
      case "clear":
        output = "CLEAR_SCREEN";
        break;
      default:
        output = `sh: command not found: ${cmd}. Type 'help' to review available terminal scripts.`;
    }

    return sendSuccess(res, { output });
  } catch (error) {
    console.error("Sandbox Shell Error:", error);
    return sendError(res, "Virtual shell encountered an error.", 500);
  }
}

export async function hashDemo(req: Request, res: Response) {
  try {
    const { password } = req.body;
    if (!password) return sendError(res, "Password string is required.", 400);

    // Speed comparison simulation
    const startMd5 = process.hrtime.bigint();
    const md5 = crypto.createHash("md5").update(password).digest("hex");
    const endMd5 = process.hrtime.bigint();
    const durationMd5 = Number(endMd5 - startMd5) / 1_000_000; // ms

    const startSha = process.hrtime.bigint();
    const sha256 = crypto.createHash("sha256").update(password).digest("hex");
    const endSha = process.hrtime.bigint();
    const durationSha = Number(endSha - startSha) / 1_000_000; // ms

    const startBcrypt = process.hrtime.bigint();
    const bcryptHash = await bcrypt.hash(password, 10);
    const endBcrypt = process.hrtime.bigint();
    const durationBcrypt = Number(endBcrypt - startBcrypt) / 1_000_000; // ms

    return sendSuccess(res, {
      hashes: {
        md5,
        sha256,
        bcrypt: bcryptHash
      },
      durations: {
        md5: `${durationMd5.toFixed(4)} ms`,
        sha256: `${durationSha.toFixed(4)} ms`,
        bcrypt: `${durationBcrypt.toFixed(2)} ms`
      },
      comparisonExplanation: "Bcrypt is intentionally slower than MD5 and SHA-256 (which are fast mathematical hashing algorithms). Slow algorithms make brute-force and GPU hardware attacks extremely difficult, protecting users against leaks."
    });
  } catch (error) {
    console.error("Hashing Demo Error:", error);
    return sendError(res, "Password hashing demo failed.", 500);
  }
}

export async function inspectRequest(req: Request, res: Response) {
  try {
    return sendSuccess(res, {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      query: req.query,
      cookies: req.cookies,
      body: req.body,
      ip: req.ip
    });
  } catch (error) {
    console.error("Request Inspector Error:", error);
    return sendError(res, "Request inspector failed.", 500);
  }
}
