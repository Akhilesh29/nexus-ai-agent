"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const agent_js_1 = require("./agent.js");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "*";
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
    }
    next();
});
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
// ── SSE streaming endpoint ────────────────────────────────────────────────────
app.post("/api/run", async (req, res) => {
    const { task } = req.body;
    if (!task?.trim()) {
        res.status(400).json({ error: "task is required" });
        return;
    }
    // Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    const send = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    try {
        await (0, agent_js_1.runAgent)(task, (step) => send(step));
        send({ type: "done" });
    }
    catch (err) {
        send({ type: "error", content: String(err) });
    }
    finally {
        res.end();
    }
});
app.listen(PORT, () => {
    console.log(`\n🚀 NEXUS Agent running at http://localhost:${PORT}\n`);
});
