import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import { runAgent } from "./agent.js";

const app = express();
const PORT = process.env.PORT ?? 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "*";

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

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

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// ── SSE streaming endpoint ────────────────────────────────────────────────────
app.post("/api/run", async (req: Request, res: Response) => {
  const { task } = req.body as { task: string };
  if (!task?.trim()) {
    res.status(400).json({ error: "task is required" });
    return;
  }

  // Server-Sent Events
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await runAgent(task, (step) => send(step));
    send({ type: "done" });
  } catch (err) {
    send({ type: "error", content: String(err) });
  } finally {
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 NEXUS Agent running at http://localhost:${PORT}\n`);
});
