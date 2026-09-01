from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import os
import glob
from dotenv import load_dotenv
from operator import itemgetter


from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser


load_dotenv()
if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY is missing in the .env file!")

app = FastAPI(title="Sri Lankan Legal AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading AI System... ⏳")

documents = []
dataset_path = os.path.join(os.path.dirname(__file__), "dataset", "*.pdf")
pdf_files = glob.glob(dataset_path)

if not pdf_files:
    print("⚠️ Warning: No PDF files found in the 'dataset' folder!")
else:
    for file in pdf_files:
        try:
            loader = PyMuPDFLoader(file)
            documents.extend(loader.load())
        except Exception as e:
            print(f"Error loading {file}: {e}")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = text_splitter.split_documents(documents)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_db = FAISS.from_documents(chunks, embeddings)
retriever = vector_db.as_retriever(search_kwargs={"k": 4})

llm = ChatGoogleGenerativeAI(model="gemini-3.6-flash", temperature=0.1)

# 1. Add Chat History to the Prompt
# backend/main.py හි වෙනස් විය යුතු කොටස

prompt_template = """
You are a highly accurate and friendly Sri Lankan Legal AI Assistant. 

Instructions:
1. For general greetings or conversational messages (e.g., "Hi", "Hello", "Thank you"), respond politely, introduce yourself as a Legal AI Assistant, and ask how you can help.
2. For legal questions, use ONLY the following pieces of retrieved context to answer. 
3. Whenever you state a legal fact, you MUST include the [Source Document: ...] name to show where you found it.
4. If a legal question's answer is not contained in the context, strictly say "I cannot find the exact legal provision for this in the provided documents."
5. Format your answers beautifully using Markdown (bolding, bullet points, and clear paragraphs).

Previous Conversation History:
{chat_history}

Context: 
{context}

Question: {question}
Answer:"""

prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question", "chat_history"])

def format_docs(docs):
    return "\n\n".join(f"[Source Document: {os.path.basename(doc.metadata.get('source', 'Unknown'))}]\n{doc.page_content}" for doc in docs)

# 2. Setup QA Chain with History
qa_chain = (
    {
        "context": itemgetter("question") | retriever | format_docs, 
        "question": itemgetter("question"),
        "chat_history": itemgetter("chat_history")
    }
    | prompt
    | llm
    | StrOutputParser()
)

print("AI System is ready! 🚀")

# 3. Data models for Frontend Requests
class ChatMessage(BaseModel):
    role: str
    content: str

class QuestionRequest(BaseModel):
    question: str
    history: List[ChatMessage] = []

@app.post("/api/ask", summary="Ask a legal question with streaming")
async def ask_question(req: QuestionRequest):
    try:
        # Format history into a string
        formatted_history = "\n".join([f"{'User' if msg.role == 'user' else 'AI'}: {msg.content}" for msg in req.history])
        
        # Generator function for streaming chunks
        async def generate():
            try:
                async for chunk in qa_chain.astream({
                    "question": req.question,
                    "chat_history": formatted_history
                }):
                    yield chunk
            except Exception as e:
                yield f"\n\nError generating response: {str(e)}"

        return StreamingResponse(generate(), media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))