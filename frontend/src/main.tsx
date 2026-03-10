// Font imports MUST come before CSS file imports
import '@fontsource/geist-sans';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource-variable/jetbrains-mono';

// CSS imports: tokens first (provides :root vars), then reset, then global
import './styles/tokens.css';
import './styles/reset.css';
import './styles/global.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
