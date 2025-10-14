from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from .db import engine, init_db
import os

app = FastAPI(title="Demo API (FastAPI + Postgres)")

# CORS cho dev nếu cần
origins = [os.getenv("CORS_ORIGINS", "http://localhost")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ItemIn(BaseModel):
    title: str

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/items")
def list_items():
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT id, title FROM items ORDER BY id DESC")).mappings().all()
        return {"items": list(rows)}

@app.post("/api/items", status_code=201)
def create_item(item: ItemIn):
    if not item.title.strip():
        raise HTTPException(status_code=400, detail="Title is required.")
    with engine.begin() as conn:
        conn.execute(text("INSERT INTO items(title) VALUES(:t)"), {"t": item.title})
    return {"message": "created"}
