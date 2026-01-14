// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  // i off this because my css property was writyen x2
  // <StrictMode>
    <App />
  //</StrictMode>
)
