<div align="center">

# ⚖️ Sri Lankan Legal AI Assistant

**AI-powered legal information assistant for Sri Lankan Law, built on Retrieval-Augmented Generation.**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white)](https://www.langchain.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Educational-lightgrey?style=flat-square)](#-license)

An AI legal-information assistant that retrieves relevant passages from Sri Lankan legal documents and generates context-aware, cited answers using a large language model.

[Features](#-features) • [How It Works](#-how-it-works) • [Tech Stack](#%EF%B8%8F-technology-stack) • [Getting Started](#-getting-started) • [Roadmap](#-roadmap)

</div>

---

## 📌 Overview

Sri Lankan Legal AI Assistant combines **semantic search** over a curated legal knowledge base with a **generative LLM** to answer natural-language questions about Sri Lankan law. Instead of relying on the model's raw memory, every answer is grounded in retrieved source text — reducing hallucination and keeping responses traceable.

> ⚠️ **This tool provides legal information, not legal advice.** See the [disclaimer](#%EF%B8%8F-legal-disclaimer) below.

## ✨ Features

| | |
|---|---|
| ⚖️ | Ask natural-language questions about Sri Lankan law |
| 🧠 | Retrieval-Augmented Generation (RAG) pipeline |
| 🔎 | Semantic search via embeddings + FAISS vector index |
| 🤖 | Google Gemini LLM integration |
| ⚡ | Real-time streaming responses |
| 💬 | Persistent, per-user chat history |
| 🎨 | Modern, responsive UI |
| 📝 | Full Markdown rendering in chat |
| 🗄️ | Supabase (PostgreSQL) backend |
| 🐳 | One-command Docker / Docker Compose setup |

## 🧠 How It Works

<div align="center">
<img width="720" alt="RAG pipeline diagram" src="https://github.com/user-attachments/assets/1db63747-5a74-44f8-92d9-78200e79bcef" />
</div>

1. **Ingest** — Sri Lankan legal documents are chunked and embedded using Hugging Face embedding models.
2. **Index** — Embeddings are stored in a FAISS vector index for fast semantic retrieval.
3. **Retrieve** — A user's question is embedded and matched against the index to pull the most relevant passages.
4. **Generate** — Retrieved context + the question are passed to Google Gemini, which streams a grounded response back to the UI.
5. **Persist** — Conversations are saved to Supabase for continuity across sessions.

## 🛠️ Technology Stack

<table>
<tr><td valign="top" width="33%">

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- React Markdown

</td><td valign="top" width="33%">

**Backend & AI**
- Python
- FastAPI
- LangChain
- Hugging Face Embeddings
- FAISS
- Google Gemini
- Uvicorn

</td><td valign="top" width="33%">

**Database & Deployment**
- Supabase
- PostgreSQL
- Docker
- Docker Compose

</td></tr>
</table>

## 🚀 Getting Started

### Option A — Docker (recommended)

```bash
# Build and run
docker-compose up --build

# Run in the background
docker-compose up -d --build

# Stop
docker-compose down
```

### Option B — Run locally

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🔐 Environment Variables

Create the required `.env` files and add your API keys and database credentials:

```env
GOOGLE_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

> 🔒 **Never commit API keys, passwords, or `.env` files to version control.**

## ⚖️ Legal Disclaimer

This application provides AI-generated legal information for **educational and informational purposes only**. Responses do **not** constitute legal advice and should not replace consultation with a qualified legal professional. Answer accuracy depends on the documents available in the knowledge base and the limitations of the underlying AI model.

## 🎯 Project Purpose

This project demonstrates practical, full-stack application of:

- Generative AI & Large Language Models
- Retrieval-Augmented Generation (RAG)
- Semantic search & vector databases
- Natural Language Processing
- Real-time streaming APIs
- Cloud database integration (Supabase)
- Dockerized deployment



## 📄 License

This project is intended for educational and research purposes. See [`LICENSE`](./LICENSE) for full terms.

---

<div align="center">

**Built with Generative AI • RAG • Software Engineering • Sri Lankan Legal Knowledge**

Developed by **Srishan Mandawala**

</div>
