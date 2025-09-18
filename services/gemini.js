import { Portkey } from 'portkey-ai';
import dotenv from "dotenv";
dotenv.config();

const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY,
});

export async function askGemini(contextChunks, userQuery) {
  const contextText = contextChunks
    .map((chunk, i) => `(${i + 1}) ${chunk.document}`)
    .join("\n\n");

  const prompt = `
You are a helpful news assistant.
Use the following context from news articles to answer the question:

Context:
${contextText}

Question: ${userQuery}
Answer:
`;

  try {
    const res = await portkey.chat.completions.create({
      model: "@news-bot-gemini-v3/gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
      headers: {
        "x-portkey-config": "news-bot-gemini-v3",
      },
    });

    return res.choices[0]?.message?.content || "No response.";
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    return "Sorry, I couldn't fetch the answer right now.";
  }
}
