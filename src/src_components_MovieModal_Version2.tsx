import React, { useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { UserType } from "../App";

type Props = {
  movie: any;
  user: UserType;
  onClose: (refresh: boolean) => void;
};

export default function MovieModal({ movie, user, onClose }: Props) {
  const [title, setTitle] = useState(movie ? movie.title : "");
  const [posterUrl, setPosterUrl] = useState(movie ? movie.posterUrl : "");
  const [rating, setRating] = useState(movie ? (movie.ratings && movie.ratings[user.username]) : "");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) {
      setError("Title required");
      return;
    }
    if (!posterUrl) {
      setError("Poster URL required");
      return;
    }
    if (movie) {
      // Modify existing
      const newRatings = { ...(movie.ratings || {}) };
      if (rating) {
        newRatings[user.username] = parseFloat(rating);
      } else {
        delete newRatings[user.username];
      }
      await updateDoc(doc(db, "movies", movie.id), {
        title,
        posterUrl,
        ratings: newRatings,
      });
    } else {
      // Add new
      await addDoc(collection(db, "movies"), {
        title,
        posterUrl,
        ratings: rating ? { [user.username]: parseFloat(rating) } : {},
      });
    }
    onClose(true);
  }

  return (
    <div style={{
      position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "#000a",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#181f2a", color: "#fff", borderRadius: 16, padding: 32, minWidth: 320, boxShadow: "0 6px 32px #000a"
      }}>
        <h2 style={{ color: "#3399ff" }}>{movie ? "Edit Movie" : "Add Movie"}</h2>
        <div style={{ margin: "16px 0" }}>
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #222", background: "#111", color: "#fff" }} required />
        </div>
        <div style={{ margin: "16px 0" }}>
          <label>Poster URL</label>
          <input value={posterUrl} onChange={e => setPosterUrl(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #222", background: "#111", color: "#fff" }} required />
          <div style={{ marginTop: 6, fontSize: 12, color: "#89f" }}>
            Paste a direct image link (e.g. from imdb, tmdb, imgur, postimages, etc)
          </div>
        </div>
        <div style={{ margin: "16px 0" }}>
          <label>Your Rating (1.0 to 10.0)</label>
          <input
            type="number"
            min={1}
            max={10}
            step={0.1}
            value={rating}
            onChange={e => setRating(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #222", background: "#111", color: "#fff" }}
          />
        </div>
        {error && <div style={{ color: "#ff6666", marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button type="button" onClick={() => onClose(false)} style={{ background: "#222", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px" }}>Cancel</button>
          <button type="submit" style={{ background: "#3399ff", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700 }}>{movie ? "Save" : "Add"}</button>
        </div>
      </form>
    </div>
  );
}