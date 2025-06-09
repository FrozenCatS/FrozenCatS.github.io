import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

type UserType = {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    const snap = await getDocs(collection(db, "users"));
    setUsers(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as UserType[]
    );
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    await addDoc(collection(db, "users"), {
      username: newUsername,
      password: newPassword,
      isAdmin: newIsAdmin,
    });
    setNewUsername("");
    setNewPassword("");
    setNewIsAdmin(false);
    fetchUsers();
  }

  async function handleDeleteUser(id: string) {
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
  }

  async function handleToggleAdmin(id: string, isAdmin: boolean) {
    await updateDoc(doc(db, "users", id), { isAdmin: !isAdmin });
    fetchUsers();
  }

  return (
    <div style={{ background: "#121c2b", color: "#fff", borderRadius: 12, padding: 20, maxWidth: 420, margin: "40px auto" }}>
      <h2 style={{ color: "#3399ff" }}>User Management</h2>
      <form onSubmit={handleAddUser} style={{ marginBottom: 20 }}>
        <input
          placeholder="Username"
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
          style={{ marginRight: 8, borderRadius: 6, border: "1px solid #222", padding: 6, background: "#181f2a", color: "#fff" }}
          required
        />
        <input
          placeholder="Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          style={{ marginRight: 8, borderRadius: 6, border: "1px solid #222", padding: 6, background: "#181f2a", color: "#fff" }}
          required
        />
        <label style={{ marginRight: 8 }}>
          <input type="checkbox" checked={newIsAdmin} onChange={e => setNewIsAdmin(e.target.checked)} /> Admin
        </label>
        <button type="submit" style={{ background: "#3399ff", color: "#fff", border: "none", borderRadius: 6, padding: "7px 14px", fontWeight: 700 }}>Add</button>
      </form>
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users.map(u => (
            <li key={u.id} style={{ background: "#181f2a", borderRadius: 6, margin: "8px 0", padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>
                <b>{u.username}</b> {u.isAdmin && <span style={{ color: "#39f", fontWeight: 700 }}>[admin]</span>}
              </span>
              <span>
                <button onClick={() => handleToggleAdmin(u.id, u.isAdmin)} style={{ marginRight: 8, background: "#222", color: "#fff", border: "none", borderRadius: 4, padding: "3px 8px" }}>
                  {u.isAdmin ? "Revoke Admin" : "Make Admin"}
                </button>
                <button onClick={() => handleDeleteUser(u.id)} style={{ background: "#ff4444", color: "#fff", border: "none", borderRadius: 4, padding: "3px 8px" }}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}