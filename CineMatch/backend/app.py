import sys
import main
from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
from main import recommend_similar_movies 
import pandas as pd
import os
from dotenv import load_dotenv


load_dotenv() 

# Flask uygulaması başlatılıyor
app = Flask(__name__)

# CORS yapılandırması
CORS(app)

# Filmlerin bulunduğu veri seti yükleniyor
df = pd.read_csv("tmdb_dataset_temiz.csv")

# Arama işlemlerinde kolaylık için film isimleri küçük harfe çevriliyor
df["title_lower"] = df["title"].str.lower()

# Otomatik tamamlama (film adı yazıldıkça öneri sunar)
@app.route("/autocomplete")
def autocomplete():
    # Kullanıcıdan gelen arama sorgusu alınır ve küçük harfe çevrilir
    query = request.args.get("query", "").strip().lower()
    if not query:
        return jsonify([])

    # Eşleşen en fazla 10 film başlığı döndürülür
    results = df[df["title_lower"].str.contains(query, na=False)]["title"].head(10).tolist()
    return jsonify(results)

# Film önerisinin yapılması
@app.route('/recommend', methods=['POST'])
def recommend():
    # Kullanıcının gönderdiği film listesi alınır
    movie_list = request.json.get('movies', [])

    if not movie_list:
        return jsonify({"error": "Film listesi boş olamaz"}), 400
    
    # Öneri fonksiyonu çağrılır
    recommendations = recommend_similar_movies(movie_list)
    
    if recommendations is None or recommendations.empty:
        return jsonify({"error": "Öneri alınamadı, lütfen geçerli filmler girin."}), 404

    # Yalnızca gerekli kolonlar alınır
    selected_cols = ['title', 'poster_path', 'vote_average']
    for col in selected_cols:
        if col not in recommendations.columns:
            recommendations[col] = None  # Eksik sütun varsa boş bırak

    # JSON formatında geri döndür
    recommendations_json = recommendations[selected_cols].to_dict(orient='records')
    return jsonify({"recommendations": recommendations_json})

# Filmlerin detay bilgilerini döndürülür
@app.route('/movie-info', methods=['POST'])
def movie_info():
    movie_titles = request.json.get('movies', [])
    if not movie_titles:
        return jsonify([])

    # Film isimlerini küçük harfe çevir
    movie_titles_lower = [m.lower() for m in movie_titles]
    filtered = df[df['title_lower'].isin(movie_titles_lower)]

    # Filmle ilgili detay bilgiler döndürülür
    results = filtered[[
        'title', 'poster_path', 'vote_average', 'vote_count', 'release_date',
        'overview', 'genres', 'production_companies', 'production_countries'
    ]].to_dict(orient='records')
    
    return jsonify(results)

# Önerilen filmler üstüne tıkladığımızda çıkan film detaylarının alınması
@app.route("/film-detail")
def film_detail():
    # Film başlığı sorgudan alınır
    title = request.args.get("title", "").lower()
    if not title:
        return jsonify({"error": "Başlık eksik"}), 400

    # Film veri kümesinden eşleşen satır alınır
    row = df[df['title_lower'] == title]
    if row.empty:
        return jsonify({"error": "Film bulunamadı"}), 404

    # Geri döndürülecek bilgiler toplanır
    film = row.iloc[0][[
        "title", "poster_path", "vote_average", "vote_count",
        "release_date", "overview", "tagline",
        "genres", "production_companies", "production_countries"
    ]].to_dict()

    return jsonify(film)

# YouTube API anahtarı (sunumda gösterilmemelidir, .env içine alınabilir)
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY") 

# Film ismine göre YouTube'dan fragman çeken endpoint
@app.route("/trailer")
def get_trailer():
    title = request.args.get("title", "")
    if not title:
        return jsonify({"error": "Başlık eksik"}), 400

    # YouTube'da 'film adı + trailer' şeklinde arama yapılır
    query = f"{title} trailer"
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "key": YOUTUBE_API_KEY,
        "maxResults": 1,
        "type": "video",
        "videoEmbeddable": "true"
    }

    # YouTube API'sine istek atılır
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return jsonify({"error": "YouTube API hatası"}), 500

    # Gelen sonuçlardan ilk video ID'si alınır
    items = response.json().get("items", [])
    if not items:
        return jsonify({"error": "Trailer bulunamadı"}), 404

    video_id = items[0]["id"]["videoId"]
    return jsonify({"videoId": video_id})

# Flask uygulamasını başlat (localhost:5000)
if __name__ == "__main__":
    app.run(debug=True, port=5000)
