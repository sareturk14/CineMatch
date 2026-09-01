import React, { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import FilmDetail from "./FilmDetail";

// ✅ MainPage: Ana ekran (film giriş + öneriler)
function MainPage() {
  const [numPeople, setNumPeople] = useState(0);
  const [movieNames, setMovieNames] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedMoviesData, setSelectedMoviesData] = useState([]);

  const navigate = useNavigate();

  // 🎯 Sayfa yüklenince scroll pozisyonunu geri getir
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("scrollPosition");
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
      sessionStorage.removeItem("scrollPosition");
    }
  }, []);

  useEffect(() => {
    fetch("/movie-names.json")
      .then((res) => res.json())
      .then((data) => setMovieNames(data));
  }, []);

  const handleSelect = (n) => {
    setNumPeople(n);
    setInputs(Array(n).fill(""));
    setSuggestions(Array(n).fill([]));
    setRecommendations([]);
  };

  const fetchMovieInfo = async (movieTitles) => {
    const res = await fetch("http://localhost:5000/movie-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movies: movieTitles }),
    });

    const data = await res.json();
    setSelectedMoviesData(data);
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);

    const filtered = movieNames.filter((name) =>
      name.toLowerCase().startsWith(value.toLowerCase())
    );
    const newSuggestions = [...suggestions];
    newSuggestions[index] = value.length > 0 ? filtered.slice(0, 5) : [];
    setSuggestions(newSuggestions);
  };

  const handleSuggestionClick = (index, suggestion) => {
    const newInputs = [...inputs];
    newInputs[index] = suggestion;
    setInputs(newInputs);

    const newSuggestions = [...suggestions];
    newSuggestions[index] = [];
    setSuggestions(newSuggestions);
  };

  const handleSubmit = async () => {
    await fetchMovieInfo(inputs);
    const res = await fetch("http://localhost:5000/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movies: inputs }),
    });

    const data = await res.json();
    setRecommendations(data.recommendations);
  };

  // ✅ Film posterine tıklanınca scroll konumunu kaydet ve detay sayfasına git
  const handleMovieClick = (title) => {
    sessionStorage.setItem("scrollPosition", window.scrollY); // konumu kaydet
    const encodedTitle = encodeURIComponent(title);
    navigate(`/film/${encodedTitle}`);
  };

  return (
    <div className="container">
      <h1>KAÇ KİŞİ FİLM ÖNERİSİ ALMAK İSTİYOR?</h1>
      <div className="buttons">
        {[1, 2, 3, 4].map((n) => (
          <button key={n} onClick={() => handleSelect(n)}>
            {n}
          </button>
        ))}
      </div>

      <div className="inputs">
        {inputs.map((input, i) => (
          <div key={i} className="input-wrapper">
            <input
              type="text"
              placeholder={`Kişi ${i + 1} için film girin`}
              value={input}
              onChange={(e) => handleInputChange(i, e.target.value)}
            />
            {suggestions[i] && suggestions[i].length > 0 && (
              <ul className="suggestions">
                {suggestions[i].map((s, j) => (
                  <li key={j} onClick={() => handleSuggestionClick(i, s)}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="selected-posters">
        {selectedMoviesData.map((movie, i) => (
          <div key={i} className="poster-card">
            <img
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
              alt={movie.title}
            />
            <p>{movie.title}</p>
          </div>
        ))}
      </div>

      {inputs.length > 0 && (
        <button className="ok-button" onClick={handleSubmit}>
          OK
        </button>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h2>Önerilen Filmler</h2>
          <div className="recommended-posters">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="poster-card"
                onClick={() => handleMovieClick(rec.title)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w200${rec.poster_path}`}
                  alt={rec.title}
                />
                <p>{rec.title}</p>
                <p style={{ fontSize: "14px", color: "#ccc" }}>
                  ⭐ {rec.vote_average}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Router tanımı burada sade kalıyor
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/film/:title" element={<FilmDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
