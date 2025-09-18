// embeddings/jina_embedder.js

import { Portkey } from "portkey-ai";

const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY, // Or JINA_API_KEY
});

export async function embedTexts(texts) {
  const res = await portkey.embeddings.create({
    input: texts,
    model: "jina-embeddings-v2-base-en",
  });

  return res.data.map((item) => item.embedding);
}
