# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from .db import engine, init_db
import os

app = FastAPI(title="Demo CRUD API (FastAPI + Postgres)")

# CORS cho dev
origins = [os.getenv("CORS_ORIGINS", "http://localhost:5173"), "http://localhost"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ItemIn(BaseModel):
    title: str

class ItemOut(BaseModel):
    id: int
    title: str

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health():
    return {"status": "ok"}

# READ (list)
@app.get("/api/items", response_model=dict)
def list_items():
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT id, title FROM items ORDER BY id DESC")).mappings().all()
        return {"items": list(rows)}

# READ (detail)
@app.get("/api/items/{item_id}", response_model=ItemOut)
def get_item(item_id: int):
    with engine.connect() as conn:
        row = conn.execute(text("SELECT id, title FROM items WHERE id=:id"), {"id": item_id}).mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Item not found")
        return row

# CREATE
@app.post("/api/items", status_code=201)
def create_item(item: ItemIn):
    title = item.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title is required.")
    with engine.begin() as conn:
        conn.execute(text("INSERT INTO items(title) VALUES(:t)"), {"t": title})
    return {"message": "created"}

# UPDATE
@app.put("/api/items/{item_id}", response_model=ItemOut)
def update_item(item_id: int, item: ItemIn):
    title = item.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title is required.")
    with engine.begin() as conn:
        result = conn.execute(text("UPDATE items SET title=:t WHERE id=:id"), {"t": title, "id": item_id})
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        row = conn.execute(text("SELECT id, title FROM items WHERE id=:id"), {"id": item_id}).mappings().first()
        return row

# DELETE
@app.delete("/api/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    with engine.begin() as conn:
        result = conn.execute(text("DELETE FROM items WHERE id=:id"), {"id": item_id})
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Item not found")
    return
