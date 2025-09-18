// news_ingest/process_articles.js

import fs from "fs/promises";
import path from "path";

// Simple chunking logic: split into paragraphs, group into chunks
function chunkText(text, maxWords = 200) {
  const paragraphs = text.split(/\n+/);
  const chunks = [];

  let currentChunk = "";
  let wordCount = 0;

  for (const para of paragraphs) {
    const words = para.split(/\s+/).length;
    if (wordCount + words > maxWords) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = para;
      wordCount = words;
    } else {
      currentChunk += "\n" + para;
      wordCount += words;
    }
  }

  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
}

const INPUT_DIR = "./news_ingest/sample_articles";
const OUTPUT_FILE = "./news_ingest/processed_chunks.json";

async function processAllArticles() {
  const files = await fs.readdir(INPUT_DIR);
  const allChunks = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const fullPath = path.join(INPUT_DIR, file);
    const data = JSON.parse(await fs.readFile(fullPath, "utf-8"));

    const chunks = chunkText(data.content);
    chunks.forEach((chunk, i) => {
      allChunks.push({
        id: `${file}-${i}`,
        text: chunk,
        metadata: {
          title: data.title,
          pubDate: data.pubDate,
          source: data.link,
        },
      });
    });
  }

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(allChunks, null, 2));
  console.log(`✅ Saved ${allChunks.length} chunks to ${OUTPUT_FILE}`);
}

processAllArticles().catch(console.error);
