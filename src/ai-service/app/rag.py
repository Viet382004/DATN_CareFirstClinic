import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

FAISS_PATH = "/app/data/faiss_index"
KB_PATH = "/app/data/knowledge_base.txt"
EMBED_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

_retriever = None  # cache singleton

def _get_embeddings():
    return HuggingFaceEmbeddings(
        model_name=EMBED_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

def build_index():
    with open(KB_PATH, "r", encoding="utf-8") as f:
        text = f.read()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400, chunk_overlap=60,
        separators=["\n## ", "\n# ", "\n\n", "\n"]
    )
    docs = [Document(page_content=c) for c in splitter.split_text(text)]
    vs = FAISS.from_documents(docs, _get_embeddings())
    vs.save_local(FAISS_PATH)
    print(f"[rag] Built index: {len(docs)} chunks")
    return vs

def get_retriever():
    global _retriever
    if _retriever is None:
        if not os.path.exists(FAISS_PATH):
            build_index()
        vs = FAISS.load_local(FAISS_PATH, _get_embeddings(),
                               allow_dangerous_deserialization=True)
        _retriever = vs.as_retriever(search_kwargs={"k": 3})
    return _retriever