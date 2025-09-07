import React from "react";
import { Analytics } from "@vercel/analytics/react";
import Routes from "./Routes";
import PWAInstallPrompt from "./components/ui/PWAInstallPrompt";

function App() {
  return (
    <>
      <Routes />
      <PWAInstallPrompt />
      <Analytics />
    </>
  );
}

export default App;
