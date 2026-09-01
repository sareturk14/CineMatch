  CineMatch
A smart movie recommendation web app built with a Python/Flask backend and a React frontend. The system uses machine learning (MiniLM & FAISS) to provide semantic similarity-based movie suggestions.
![CineMatch_1](https://github.com/user-attachments/assets/50207be3-6784-4365-b2e2-f4c48c448694)
![CineMatch_2](https://github.com/user-attachments/assets/d4f634a3-3abf-415f-846b-dce5cfd7d504)
![CineMatch_3](https://github.com/user-attachments/assets/cada47f5-e1d7-41fd-ad5d-9983ce28c4d2)

 About The Project:
Ever finished a great movie and wondered what to watch next? This application solves that problem by moving beyond simple genre-based recommendations.
Users can enter one or more of their favorite movies, and the system leverages a powerful semantic search engine to analyze the movie's context and suggest 10 other films with similar themes, plots, and moods.
The goal was to create a fast, accurate, and interactive recommendation experience using modern machine learning and web development technologies.

 Features:
Semantic Similarity Recommendations: Utilizes MiniLM sentence-transformer embeddings to understand the meaning behind movie descriptions, not just keywords.
High-Speed Vector Search: Implemented with FAISS (Facebook AI Similarity Search) for near-instantaneous search through thousands of movie vectors.
Interactive User Interface: A clean and responsive frontend built with React.
Autocomplete Movie Search: Helps users quickly find and select the movies they are looking for.
Rich Movie Details: Displays high-resolution posters, plot summaries, and official trailers for each recommended movie.
Detailed Movie Page: Users can click on any movie to see more in-depth information.
