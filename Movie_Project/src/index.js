// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Varsayılan stil dosyanız (isteğe bağlı)
import App from './App';  // App.js dosyanızı import edin

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />  {/* App bileşenini render ediyoruz */}
  </React.StrictMode>
);
