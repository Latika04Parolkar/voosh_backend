import { CloudClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";
import dotenv from "dotenv";
dotenv.config();

const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_TENANT,
  database: process.env.CHROMA_DATABASE,
});

const embeddingFunction = new DefaultEmbeddingFunction();

let collection;

export async function initChroma() {
  try {
    collection = await client.getCollection({ name: "news_chunks", embeddingFunction });
    console.log("✅ Loaded existing Chroma collection with default embedding");
  } catch (err) {
    console.log("⚠️ Collection not found, creating new one");
    collection = await client.createCollection({
      name: "news_chunks",
      embeddingFunction,
    });
    console.log("✅ Created new Chroma collection with default embedding");
  }
}

export async function addChunks(docs) {
  if (!collection) await initChroma();
  await collection.add({
    ids: docs.map(doc => doc.id),
    documents: docs.map(doc => doc.text),
    metadatas: docs.map(doc => doc.metadata),
  });
  console.log(`✅ Added ${docs.length} chunks`);
}

export async function queryChunks(queryText, topK = 5) {
  if (!collection) await initChroma();
  const result = await collection.query({
    queryTexts: [queryText],
    nResults: topK,
  });
  return result.documents[0].map((doc, i) => ({
    document: doc,
    metadata: result.metadatas[0][i],
    distance: result.distances[0][i],
  }));
}
