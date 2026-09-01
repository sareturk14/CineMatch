import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./FilmDetail.css";

function FilmDetail() {
  const { title } = useParams();
  const [movie, setMovie] = useState(null);
  const [videoId, setVideoId] = useState(null);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      const res = await fetch("http://localhost:5000/movie-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movies: [title] }),
      });

      const data = await res.json();
      if (data && data.length > 0) {
        setMovie(data[0]);
      }
    };

    const fetchTrailer = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/trailer?title=${encodeURIComponent(title)}`
        );
        const data = await res.json();
        if (data.videoId) {
          setVideoId(data.videoId);
        }
      } catch (err) {
        console.error("Trailer yüklenemedi", err);
      }
    };

    fetchMovieDetail();
    fetchTrailer();
  }, [title]);

  if (!movie) {
    return <div style={{ color: "white", padding: "20px" }}>Yükleniyor...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        padding: "40px",
        color: "white",
        backgroundColor: "#000",
        gap: "40px",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        width: "100%",
      }}
    >
      {/* Sol taraf */}
      <div style={{ flex: "0 0 320px" }}>
        <img
          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
          alt={movie.title}
          style={{
            borderRadius: "12px",
            maxHeight: "500px",
            width: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Sağ taraf */}
      <div
        style={{
          flex: "1", // Sağ tarafın esnek olmasını sağlar
          minWidth: "350px", // Sağ tarafın en az bu genişlikte olmasını sağlarız
          paddingTop: "10px", // İçeriğin üst kısmındaki boşluğu daha da küçültürüz
        }}
      >
        <div className="film-info" style={{ marginTop: "10px" }}>
          <h1 style={{ marginBottom: "10px" }}>{movie.title}</h1>
          <p style={{ marginTop: "0", marginBottom: "10px" }}>
            <strong>Özet:</strong> {movie.overview}
          </p>
          <p style={{ marginTop: "0", marginBottom: "10px" }}>
            <strong>Oy Ortalaması:</strong>{" "}
            {Number(movie.vote_average).toFixed(1)}
          </p>
          <p style={{ marginTop: "0", marginBottom: "10px" }}>
            <strong>Oy Sayısı:</strong> {movie.vote_count}
          </p>
          <p style={{ marginTop: "0", marginBottom: "10px" }}>
            <strong>Çıkış Tarihi:</strong> {movie.release_date}
          </p>
          <p style={{ marginTop: "0", marginBottom: "10px" }}>
            <strong>Türler:</strong> {movie.genres}
          </p>
          <p style={{ marginTop: "0", marginBottom: "10px" }}>
            <strong>Yapımcı Şirketler:</strong> {movie.production_companies}
          </p>
          <p style={{ marginTop: "0", marginBottom: "10px" }}>
            <strong>Ülkeler:</strong> {movie.production_countries}
          </p>
        </div>

        {/* Fragman - Ortalanmış ve büyük */}
        {videoId && (
          <div className="iframe-container" style={{ marginTop: "40px" }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilmDetail;
