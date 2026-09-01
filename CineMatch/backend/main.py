import pandas as pd
import faiss
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer

# Film verilerini CSV dosyasından okuma
df = pd.read_csv("tmdb_dataset_temiz.csv")

# İlgili sütunları seçiyoruz 
df = df[['title', 'overview', 'tagline', 'genres', 'keywords', 'vote_average', 'vote_count',
         'release_date', 'homepage', 'poster_path', 'production_companies',
         'production_countries']]

# Eksik (null) verileri boş string ile dolduruyoruz
df.fillna('', inplace=True)

# Filmin özet bilgilerini birleştiren yardımcı fonksiyon(bu fonksiyon film benzerliğinin üstüne kurulduğu parametreleri içerir)
def combine_fields(row):
    return f"{row['title']}. {row['tagline']}. {row['genres']}. {row['keywords']}. {row['overview']}"

# Her film için birleştirilmiş metin sütunu oluşturuluyor
df['text'] = df.apply(combine_fields, axis=1)

# Cümleleri vektörleştirmek için model yükleniyor
model = SentenceTransformer('all-MiniLM-L6-v2')

# Daha önceden oluşturulmuş embedding'ler pickle dosyasından yükleniyor
with open("movie_embeddings.pkl", "rb") as f:
    embeddings = pickle.load(f)

# FAISS için vektör boyutu belirleniyor ve index oluşturuluyor
dimension = embeddings[0].shape[0]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))  # Vektörler FAISS indeksine ekleniyor

# Film adlarını küçük harfe çevirerek indekslenmiş hale getiriyoruz
title_to_index = {title.lower(): i for i, title in enumerate(df['title'])}

# Tek bir filmin vektörünü döndüren fonksiyon
def get_movie_vector(movie_name):
    idx = title_to_index.get(movie_name.lower())
    if idx is not None:
        return embeddings[idx]
    else:
        print(f"Film bulunamadı: {movie_name}")
        return None

# Tek bir film adına göre benzer filmleri öneren fonksiyon
def recommend_movies(input_movie, top_k=10):
    movie_vector = get_movie_vector(input_movie)
    if movie_vector is None:
        print("Film bulunamadı.")
        return
    
    # FAISS ile en yakın komşular aranıyor
    D, I = index.search(np.array([movie_vector]).astype("float32"), top_k+1)
    
    # İlk sonuç girilen film olduğu için atlanıyor
    results = df.iloc[I[0][1:]]
    
    # İlgili sütunlar döndürülüyor
    return results[['title', 'overview', 'genres','vote_average','vote_count','poster_path']]

# Birden fazla filmin ortalama vektörünü hesaplayan fonksiyon
def get_combined_vector(movie_names):
    vectors = []
    for name in movie_names:
        vec = get_movie_vector(name)
        if vec is not None:
            vectors.append(vec)
        else:
            print(f"Film bulunamadı: {name}")
    
    # Geçerli film yoksa None döndür
    if not vectors:
        return None
    
    # Vektörlerin ortalaması alınıyor
    avg_vec = np.mean(vectors, axis=0)

    # Ufak bir rastgele gürültü (noise) eklenerek çeşitlilik sağlanıyor
    noise = np.random.normal(0, 0.005, avg_vec.shape)
    avg_vec_noisy = avg_vec + noise
    return avg_vec_noisy

# Birden fazla filme göre benzer filmleri öneren fonksiyon
def recommend_similar_movies(movie_list, top_k=10):
    combined_vector = get_combined_vector(movie_list)
    if combined_vector is None:
        print("Hiçbir geçerli film bulunamadı.")
        return
    
    # FAISS ile benzer filmler aranıyor (20 tane seçiliyor)
    D, I = index.search(np.array([combined_vector]).astype("float32"), 20 + len(movie_list))
    
    # Girilen filmler önerilerden çıkarılıyor
    found_titles = set([title.lower() for title in movie_list])
    results = df.iloc[I[0]]
    results = results[~results['title'].str.lower().isin(found_titles)]
    
    # Puanlar yuvarlanıyor
    results['vote_average'] = results['vote_average'].round(1)
    
    # Sonuçlar rastgele sıralanıp belirli sayıda öneri seçiliyor
    results = results.sample(n=min(top_k, len(results)), random_state=None)

    # Belirlenen sütunlar döndürülüyor
    return results[['title','vote_average','vote_count','release_date','homepage','overview','poster_path','tagline','genres','production_companies','production_countries','keywords']].head(top_k)
