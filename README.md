# 🧠 Voosh Backend

This is the backend service for the Voosh AI news assistant.  
It fetches news articles, processes them into semantic chunks, embeds them, stores them in ChromaDB, and answers user queries using Gemini.

---

## 🚀 Features

- ✅ Fetches articles from RSS feeds (BBC, Reuters, etc.)
- ✅ Parses and chunks content intelligently
- ✅ Embeds using Jina Embeddings via Portkey API
- ✅ Stores semantic vectors in ChromaDB (hosted)
- ✅ Gemini-powered Q&A on the news content
- ✅ Uses Redis for session-based chat history
- ✅ RESTful API with `/chat`, `/chat/history`, `/chat/reset`

---

## 📁 Folder Structure

```
voosh_backend/
│
├── app.js                     # Express server entry point
├── .env                      # Local environment variables (ignored by Git)
├── .env.example              # Sample env file for setup
├── routes/
│   └── chat.js               # API routes for chat, history, reset
│
├── services/
│   ├── gemini.js             # Query Gemini via Portkey
│   └── redis.js              # Redis client setup
│
├── embeddings/
│   └── jina_embedder.js      # Text embedding using Portkey & Jina
│
├── news_ingest/
│   ├── fetch_articles.js     # Fetch and save RSS articles
│   ├── process_articles.js   # Chunk articles into vector-ready format
│   └── index_chunks.js       # Add chunks to ChromaDB
│
├── vector_store/
│   └── chroma_client.js      # ChromaDB client and operations
│
└── package.json
```

---

## ⚙️ Environment Setup

Create a `.env` file based on the following:

```
PORT=3001
PORTKEY_API_KEY=your_portkey_api_key
CHROMA_API_KEY=your_chroma_api_key
CHROMA_TENANT=your_chroma_tenant
CHROMA_DATABASE=your_chroma_database
REDIS_URL=redis://localhost:6379
```

Create it by copying:

```
cp .env.example .env
```

---

## 📦 Install Dependencies

```
npm install
```

---

## 🧪 Running Locally

### 1. Start the Server

```
npm run dev
```

The backend will run on:  
`http://localhost:3001`

---

## 📰 Article Ingestion Workflow

### Step 1: Fetch Articles

```
node news_ingest/fetch_articles.js
```

- Saves top news articles as `.json` files in `sample_articles/`

### Step 2: Chunk the Articles

```
node news_ingest/process_articles.js
```

- Outputs `processed_chunks.json` for embedding

### Step 3: Index into ChromaDB

```
node news_ingest/index_chunks.js
```

- Embeds and stores semantic chunks

---

## 🧠 API Endpoints

### `POST /chat`

Send a user query, get AI answer based on retrieved news chunks.

**Request:**

```json
{
  "sessionId": "abc123",
  "message": "What's the latest from BBC?"
}
```

**Response:**

```json
{
  "response": "Gemini-generated answer..."
}
```

---

### `GET /chat/history/:sessionId`

Fetch past conversation from Redis.

---

### `POST /chat/reset`

Reset session.

```json
{
  "sessionId": "abc123"
}
```
## 🙏 Credits

- 🧩 Embeddings: Jina via Portkey
- 🧠 LLM: Gemini via Portkey
- 🧠 Vector DB: ChromaDB Cloud
- ⚡ Server: Express.js
- 💬 Cache/Chat History: Redis
