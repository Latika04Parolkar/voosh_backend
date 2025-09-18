// routes/chat.js
import express from "express";
import { embedTexts } from "../embeddings/jina_embedder.js";
import { initChroma, queryChunks } from "../vector_store/chroma_client.js";
import { askGemini } from "../services/gemini.js";
import redisClient from "../services/redis.js";

const router = express.Router();

// Ensure Chroma is initialized
await initChroma();

// POST /chat - handles user message
router.post("/", async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: "Missing sessionId or message." });
  }

  try {
    // Step 1: Embed the user query
    // (inside queryChunks)

    // Step 2: Retrieve top-k similar chunks
    const results = await queryChunks(message, 5); // top 5

    // Step 3: Ask Gemini with retrieved context
    const reply = await askGemini(results, message);

    // Step 4: Save chat history in Redis
    const redisKey = `session:${sessionId}`;
    await redisClient.rPush(redisKey, JSON.stringify({ role: "user", content: message }));
    await redisClient.rPush(redisKey, JSON.stringify({ role: "assistant", content: reply }));
    await redisClient.expire(redisKey, 3600); // 1 hour TTL

    res.json({ response: reply });
  } catch (err) {
    console.error("❌ Error in /chat:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// GET /chat/history/:sessionId - fetch past chat
router.get("/history/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const redisKey = `session:${sessionId}`;

  try {
    const history = await redisClient.lRange(redisKey, 0, -1);
    const parsedHistory = history.map((msg) => JSON.parse(msg));
    res.json({ history: parsedHistory });
  } catch (err) {
    console.error("❌ Error fetching history:", err.message);
    res.status(500).json({ error: "Unable to fetch history." });
  }
});

// POST /chat/reset - clear session
router.post("/reset", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  try {
    await redisClient.del(`session:${sessionId}`);
    res.json({ message: "Session cleared." });
  } catch (err) {
    console.error("❌ Error resetting session:", err.message);
    res.status(500).json({ error: "Failed to reset session." });
  }
});

export default router;
