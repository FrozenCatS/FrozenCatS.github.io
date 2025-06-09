import React, { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../styles/dock.css";

type Props = {
  onLogin: (user: { id: string; username: string; isAdmin: boolean }) => void;
};

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const q = query(
      collection(db, "users"),
      where("username", "==", username)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      setError("Invalid username or password");
      return;
    }
    const docData = snapshot.docs[0].data();
    if (docData.password !== password) {
      setError("Invalid username or password");
      return;
    }

    onLogin({
      id: snapshot.docs[0].id,
      username: docData.username,
      isAdmin: !!docData.isAdmin,
    });
  }

  return (
    <div className="login-container" style={{ minHeight: "100vh", background: "#0e1624", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <form className="login-form" onSubmit={handleSubmit} style={{ background: "#060010", padding: 32, borderRadius: 12, boxShadow: "0 8px 32px #0009", color: "#fff", minWidth: 320 }}>
        <h2 style={{ color: "#3399ff", textAlign: "center" }}>MovieRanker Login</h2>
        <div style={{ margin: "16px 0" }}>
          <label style={{ fontWeight: 600 }}>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #222", marginTop: 4, background: "#111", color: "#fff" }}
            required
          />
        </div>
        <div style={{ margin: "16px 0" }}>
          <label style={{ fontWeight: 600 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #222", marginTop: 4, background: "#111", color: "#fff" }}
            required
          />
        </div>
        {error && <div style={{ color: "#ff6666", marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", background: "#3399ff", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, padding: 10, fontSize: 18 }}>
          Login
        </button>
      </form>
    </div>
  );
}