import { Routes, Route, Navigate } from "react-router-dom";
import { FaGithub } from "react-icons/fa6";

import Landing from "./pages/Landing";
import { Youtube, Instagram, Tiktok, Spotify, Pinterest } from "./pages/Platforms";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">MS</div>
            <div className="brand-text">
              <span className="brand-title">Media Siphon</span>
              <span className="brand-subtitle">Downloader Studio</span>
            </div>
          </div>

          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-button has-tooltip"
            data-tooltip="GitHub"
            aria-label="GitHub"
            title="GitHub"
          >
            <FaGithub aria-hidden={true} focusable={false} />
          </a>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/youtube" element={<Youtube />} />
          <Route path="/instagram" element={<Instagram />} />
          <Route path="/tiktok" element={<Tiktok />} />
          <Route path="/spotify" element={<Spotify />} />
          <Route path="/pinterest" element={<Pinterest />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          &copy; {new Date().getFullYear()} Media Siphon. Local Development Build.
        </div>
      </footer>
    </div>
  );
}
