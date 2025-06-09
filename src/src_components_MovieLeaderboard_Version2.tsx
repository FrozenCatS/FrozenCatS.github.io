import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { UserType } from "../App";
import MovieModal from "./MovieModal";

type MovieType = {
  id: string;
  title: string;
  posterUrl: string;
  ratings: { [username: string]: number };
};

type Props = {
  user: UserType;
};

export default function MovieLeaderboard({ user }: Props) {
  const [movies, setMovies] = useState<MovieType[]>([]);
  const [filter, setFilter] = useState<"all" | "mine" | "dad" | "combined">("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieType | null>(null);

  async function fetchMovies() {
    const snap = await getDocs(collection(db, "movies"));
    setMovies(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as MovieType[]
    );
  }

  useEffect(() => {
    fetchMovies();
  }, []);

  function getFilteredMovies() {
    let filtered = [...movies];
    if (filter === "mine") {
      filtered = filtered.filter((m) => m.ratings && user.username in m.ratings);
    }
    if (filter === "dad") {
      filtered = filtered.filter((m) => m.ratings && "dad" in m.ratings);
    }
    if (filter === "combined") {
      filtered = filtered.filter(
        (m) => m.ratings && user.username in m.ratings && "dad" in m.ratings
      );
    }
    if (search) {
      filtered = filtered.filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.sort((a, b) => {
      // Sort by avg rating descending
      const avgA =
        mAvg(a.ratings, filter, user.username) || 0;
      const avgB =
        mAvg(b.ratings, filter, user.username) || 0;
      return avgB - avgA;
    });
  }

  function mAvg(
    ratings: { [username: string]: number },
    filterType: string,
    userName: string
  ) {
    if (!ratings) return 0;
    if (filterType === "mine") return ratings[userName];
    if (filterType === "dad") return ratings["dad"];
    if (filterType === "combined") {
      if (userName in ratings && "dad" in ratings)
        return (ratings[userName] + ratings["dad"]) / 2;
      return 0;
    }
    // "all": average of all users who have rated
    const vals = Object.values(ratings);
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  async function handleModify(movie: MovieType) {
    setEditingMovie(movie);
    setModalOpen(true);
  }

  async function handleAddMovie() {
    setEditingMovie(null);
    setModalOpen(true);
  }

  async function handleModalClose(refresh: boolean) {
    setModalOpen(false);
    setEditingMovie(null);
    if (refresh) fetchMovies();
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#3399ff" }}>Leaderboard</h2>
        <button
          onClick={handleAddMovie}
          style={{ background: "#3399ff", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700 }}
        >
          + Add Movie
        </button>
      </div>
      <div style={{ margin: "16px 0", display: "flex", gap: 12 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search movies..."
          style={{ borderRadius: 8, border: "1px solid #222", padding: "8px 12px", background: "#181f2a", color: "#fff", flex: 1 }}
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          style={{ borderRadius: 8, border: "1px solid #222", padding: "8px 12px", background: "#181f2a", color: "#fff" }}
        >
          <option value="all">All Movies</option>
          <option value="mine">My Ratings</option>
          <option value="dad">Dad's Ratings</option>
          <option value="combined">Combined (You & Dad)</option>
        </select>
      </div>
      <div>
        {getFilteredMovies().map(movie => (
          <div key={movie.id} style={{ display: "flex", alignItems: "center", background: "#060010", borderRadius: 12, margin: "12px 0", padding: 12, boxShadow: "0 2px 8px #0005" }}>
            <img
              src={movie.posterUrl}
              alt={movie.title}
              style={{ width: 75, height: 110, objectFit: "cover", borderRadius: 8, marginRight: 16, background: "#222" }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>{movie.title}</div>
              <div style={{ color: "#ccc", margin: "6px 0" }}>
                {filter === "mine"
                  ? (
                    <>
                      <StarRating rating={movie.ratings[user.username]} /> {movie.ratings[user.username]?.toFixed(1)} Stars
                    </>
                  )
                  : filter === "dad"
                    ? (
                      <>
                        <StarRating rating={movie.ratings["dad"]} /> {movie.ratings["dad"]?.toFixed(1)} Stars
                      </>
                    )
                    : filter === "combined"
                      ? (
                        <>
                          <StarRating rating={mAvg(movie.ratings, "combined", user.username)} /> {mAvg(movie.ratings, "combined", user.username).toFixed(1)} Stars (avg)
                        </>
                      )
                      : (
                        <>
                          <StarRating rating={mAvg(movie.ratings, "all", user.username)} /> {mAvg(movie.ratings, "all", user.username).toFixed(1)} Stars (avg)
                        </>
                      )
                }
              </div>
            </div>
            <button
              onClick={() => handleModify(movie)}
              style={{ background: "#3399ff", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, marginLeft: 16 }}
            >
              Modify
            </button>
          </div>
        ))}
      </div>
      {modalOpen && (
        <MovieModal movie={editingMovie} user={user} onClose={handleModalClose} />
      )}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  if (!rating) return <span style={{ color: "#777" }}>No rating</span>;
  const stars = [];
  for (let i = 1; i <= 10; i++) {
    stars.push(
      <span key={i} style={{ color: i <= Math.round(rating) ? "#ffd700" : "#444", fontSize: 18 }}>★</span>
    );
  }
  return <span>{stars}</span>;
}