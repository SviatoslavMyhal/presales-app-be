const path = require("path");
const express = require("express");

const root = path.join(__dirname, "../../dist/presales-ai");
let liveAssist;

try {
  liveAssist = require(path.join(root, "call/liveAssist.js"));
} catch (e) {
  console.warn("[PreSalesAI] call module not built. Run: npm run build\n", e.message);
}

const router = express.Router();

/** Non-streaming structured assist */
router.post("/live-assist", async (req, res, next) => {
  if (!liveAssist) {
    return res.status(503).json({ error: "PreSalesAI module not built. Run: npm run build" });
  }
  try {
    const { transcript, job_post } = req.body ?? {};
    if (!transcript || !String(transcript).trim()) {
      return res.status(400).json({ error: "transcript is required" });
    }
    const data = await liveAssist.runLiveAssistStructured({
      transcript: String(transcript).trim(),
      job_post: job_post ? String(job_post).trim() : undefined,
    });
    return res.status(200).json({ status: "success", data });
  } catch (e) {
    return next(e);
  }
});

/**
 * SSE stream for live copilot (token stream).
 * Client: EventSource or fetch with ReadableStream.
 */
router.post("/live-assist/stream", async (req, res, next) => {
  if (!liveAssist) {
    return res.status(503).json({ error: "PreSalesAI module not built. Run: npm run build" });
  }
  try {
    const { transcript, job_post } = req.body ?? {};
    if (!transcript || !String(transcript).trim()) {
      return res.status(400).json({ error: "transcript is required" });
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const gen = liveAssist.streamLiveAssist({
      transcript: String(transcript).trim(),
      job_post: job_post ? String(job_post).trim() : undefined,
    });

    for await (const chunk of gen) {
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
    }
    res.write("event: done\ndata: {}\n\n");
    res.end();
  } catch (e) {
    if (!res.headersSent) {
      return next(e);
    }
    res.end();
  }
});

module.exports = router;
