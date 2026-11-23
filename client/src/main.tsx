import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';

if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline shell registration fallback
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
