import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import { registerSW } from 'virtual:pwa-register';

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the default browser behavior of logging to console
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to user
    if (confirm('New content available! Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
