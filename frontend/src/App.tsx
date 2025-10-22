import React, { useEffect, useState } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function App() {
  const [health, setHealth] = useState("checking...");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");

  async function refresh() {
    const h = await fetch("/api/health").then(r => r.json()).catch(() => ({status:"fail"}));
    setHealth(h.status ?? "fail");
    const t = await fetch("/api/todos").then(r => r.json()).catch(() => ({todos: []}));
    setTodos(t.todos || []);
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/todos", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ title })
    });
    setTitle("");
    refresh();
  }

  async function toggle(id: number) {
    await fetch(`/api/todos/${id}/toggle`, { method: "PATCH" });
    refresh();
  }

  async function remove(id: number) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    refresh();
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📝 TodoList</h1>
      <p style={styles.health}>
        Backend status:{" "}
        <b style={{ color: health === "ok" ? "limegreen" : "red" }}>
          {health}
        </b>
      </p>

      <form onSubmit={addTodo} style={styles.form}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Nhập việc cần làm..."
          style={styles.input}
        />
        <button type="submit" style={styles.addBtn}>Thêm</button>
      </form>

      <ul style={styles.list}>
        {todos.map(todo => (
          <li key={todo.id} style={styles.item}>
            <span
              onClick={() => toggle(todo.id)}
              style={{
                ...styles.text,
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#999" : "#222"
              }}
            >
              {todo.title}
            </span>
            <button
              onClick={() => remove(todo.id)}
              style={styles.deleteBtn}
              title="Xóa công việc"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p style={{ color: "#777", textAlign: "center", marginTop: 40 }}>
          Không có công việc nào 😴
        </p>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 600,
    margin: "50px auto",
    padding: "30px",
    borderRadius: 16,
    background: "linear-gradient(145deg, #f6f7f9, #e0e3e7)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    fontFamily: "system-ui, sans-serif"
  },
  title: {
    textAlign: "center",
    fontSize: "2rem",
    marginBottom: 10,
    color: "#333"
  },
  health: {
    textAlign: "center",
    marginBottom: 20,
    color: "#555"
  },
  form: {
    display: "flex",
    gap: 8,
    marginBottom: 20
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: 8,
    outline: "none",
    fontSize: "1rem",
    transition: "border-color 0.2s",
  },
  addBtn: {
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: 500,
    transition: "background 0.3s",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "white",
    padding: "10px 14px",
    marginBottom: 8,
    borderRadius: 8,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "transform 0.1s ease, background 0.2s",
  },
  text: {
    flex: 1,
    cursor: "pointer",
    userSelect: "none",
  },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "red",
    fontSize: "1.1rem",
    cursor: "pointer",
  },
};
