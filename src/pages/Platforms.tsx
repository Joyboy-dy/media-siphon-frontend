import Downloader from "../components/Downloader";

export function Youtube() {
  return <Downloader platform="youtube" title="YouTube" accentColor="oklch(0.62 0.24 25)" />;
}

export function Instagram() {
  return <Downloader platform="instagram" title="Instagram" accentColor="oklch(0.65 0.23 351)" />;
}

export function Tiktok() {
  return <Downloader platform="tiktok" title="TikTok" accentColor="oklch(0.82 0.14 196)" />;
}

export function Spotify() {
  return <Downloader platform="spotify" title="Spotify" accentColor="oklch(0.72 0.21 142)" />;
}

export function Pinterest() {
  return <Downloader platform="pinterest" title="Pinterest" accentColor="oklch(0.55 0.22 25)" />;
}

