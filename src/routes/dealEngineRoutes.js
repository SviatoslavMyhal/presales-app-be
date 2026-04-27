const path = require("path");
const express = require("express");

const root = path.join(__dirname, "../../dist/presales-ai");
let dealService;
let questionEngine;
let solutionEngine;
let riskPsychology;

try {
  dealService = require(path.join(root, "deal/dealService.js"));
  questionEngine = require(path.join(root, "question/questionEngine.js"));
  solutionEngine = require(path.join(root, "solution/solutionEngine.js"));
  riskPsychology = require(path.join(root, "psychology/riskPsychology.js"));
} catch (e) {
  console.warn(
    "[PreSalesAI] TypeScript modules not built. Run: npm run build\n",
    e.message
  );
}

const router = express.Router();

function bodyInput(req) {
  const { job_post, client_messages, team_expertise, constraints } = req.body ?? {};
  if (!job_post || !String(job_post).trim()) {
    const err = new Error("job_post is required");
    err.status = 400;
    throw err;
  }
  return {
    job_post: String(job_post).trim(),
    client_messages: client_messages ?? "",
    team_expertise: team_expertise ?? "",
    constraints: constraints ?? "",
  };
}

router.post("/analyze", async (req, res, next) => {
  if (!dealService) {
    return res.status(503).json({ error: "PreSalesAI module not built. Run: npm run build" });
  }
  try {
    const input = bodyInput(req);
    const result = await dealService.analyzeDeal(input);
    return res.status(201).json(result);
  } catch (e) {
    return next(e);
  }
});

router.post("/questions", async (req, res, next) => {
  if (!questionEngine) {
    return res.status(503).json({ error: "PreSalesAI module not built. Run: npm run build" });
  }
  try {
    const input = bodyInput(req);
    const data = await questionEngine.generateQuestions(input);
    return res.status(200).json({ status: "success", data });
  } catch (e) {
    return next(e);
  }
});

router.post("/solution", async (req, res, next) => {
  if (!solutionEngine) {
    return res.status(503).json({ error: "PreSalesAI module not built. Run: npm run build" });
  }
  try {
    const input = bodyInput(req);
    const data = await solutionEngine.generateSolution(input);
    return res.status(200).json({ status: "success", data });
  } catch (e) {
    return next(e);
  }
});

router.post("/risks", async (req, res, next) => {
  if (!riskPsychology) {
    return res.status(503).json({ error: "PreSalesAI module not built. Run: npm run build" });
  }
  try {
    const input = bodyInput(req);
    const data = await riskPsychology.analyzePsychology(input);
    return res.status(200).json({ status: "success", data });
  } catch (e) {
    return next(e);
  }
});

let knowledgeMemory;
try {
  knowledgeMemory = require(path.join(root, "knowledge/knowledgeMemory.js")).knowledgeMemory;
} catch {
  knowledgeMemory = null;
}

router.get("/memory/recent", (req, res) => {
  if (!knowledgeMemory) {
    return res.status(503).json({ error: "PreSalesAI module not built. Run: npm run build" });
  }
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  return res.status(200).json({ deals: knowledgeMemory.recent(limit) });
});

router.get("/memory/similar", (req, res) => {
  if (!knowledgeMemory) {
    return res.status(503).json({ error: "PreSalesAI module not built. Run: npm run build" });
  }
  const q = req.query.q;
  if (!q || !String(q).trim()) {
    return res.status(400).json({ error: "q is required" });
  }
  const topK = Math.min(20, Math.max(1, Number(req.query.topK) || 5));
  return res.status(200).json({ similar: knowledgeMemory.findSimilar(String(q), topK) });
});

router.get("/:id/insights", (req, res, next) => {
  if (!dealService) {
    return res.status(503).json({ error: "PreSalesAI module not built. Run: npm run build" });
  }
  try {
    const { id } = req.params;
    const result = dealService.insightsForDeal(id);
    return res.status(200).json(result);
  } catch (e) {
    if (e.name === "DealNotFoundError") {
      return res.status(404).json({ error: e.message });
    }
    return next(e);
  }
});

module.exports = router;
