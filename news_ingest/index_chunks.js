import fs from "fs/promises";
import { initChroma, addChunks } from "../vector_store/chroma_client.js";
import dotenv from "dotenv";
dotenv.config();

const CHUNK_FILE = "./news_ingest/processed_chunks.json";

async function indexChunks() {
  const raw = await fs.readFile(CHUNK_FILE, "utf-8");
  const chunks = JSON.parse(raw);

  await initChroma();

  const batchSize = 10;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    await addChunks(batch);
  }

  console.log("✅ All chunks indexed with default embedding");
}

indexChunks().catch(e => {
  console.error("❌ Error in indexing:", e);
});
