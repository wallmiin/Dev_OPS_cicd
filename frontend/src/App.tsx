// frontend/src/App.tsx
import React, { useEffect, useState } from "react";

type Item = { id: number; title: string };

export default function App() {
  const [health, setHealth] = useState("checking...");
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  async function refresh() {
    try {
      const h = await fetch("/api/health").then((r) => r.json());
      setHealth(h.status ?? "fail");
    } catch {
      setHealth("fail");
    }

    try {
      const it = await fetch("/api/items").then((r) => r.json());
      setItems(it.items || []);
    } catch {
      setItems([]);
    }
  }

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    refresh();
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setEditingTitle(item.title);
  }

  async function saveEdit(id: number) {
    if (!editingTitle.trim()) return;
    await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingTitle }),
    });
    setEditingId(null);
    setEditingTitle("");
    refresh();
  }

  async function removeItem(id: number) {
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    refresh();
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>React + FastAPI CRUDdddddd</h1>
      <p>Backend health: <b>{health}</b></p>

      <form onSubmit={createItem} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="New item title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Add</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
        {items.map((i) => (
          <li key={i.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, display: "flex", gap: 8 }}>
            {editingId === i.id ? (
              <>
                <input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  style={{ flex: 1, padding: 6 }}
                />
                <button onClick={() => saveEdit(i.id)}>Savee</button>
                <button onClick={() => { setEditingId(null); setEditingTitle(""); }}>Cancel</button>
              </>
            ) : (
              <>
                <div style={{ flex: 1 }}>#{i.id}: {i.title}</div>
                <button onClick={() => startEdit(i)}>Edit</button>
                <button onClick={() => removeItem(i.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
