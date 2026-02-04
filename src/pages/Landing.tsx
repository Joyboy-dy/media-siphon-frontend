import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import { FaInstagram, FaTiktok, FaYoutube, FaSpotify, FaPinterest } from "react-icons/fa6";

import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

type Platform = {
  id: "youtube" | "instagram" | "tiktok" | "spotify" | "pinterest";
  name: string;
  description: string;
  accent: string;
  path: string;
  Icon: IconType;
};

export default function Landing() {
  const platforms: Platform[] = [
    {
      id: "youtube",
      name: "YouTube",
      description: "Download videos, shorts, and audio.",
      accent: "oklch(0.62 0.24 25)",
      path: "/youtube",
      Icon: FaYoutube
    },
    {
      id: "instagram",
      name: "Instagram",
      description: "Save reels, stories, and posts.",
      accent: "oklch(0.65 0.23 351)",
      path: "/instagram",
      Icon: FaInstagram
    },
    {
      id: "tiktok",
      name: "TikTok",
      description: "Download TikToks with clean exports.",
      accent: "oklch(0.82 0.14 196)",
      path: "/tiktok",
      Icon: FaTiktok
    },
    {
      id: "spotify",
      name: "Spotify",
      description: "Download tracks and playlists as MP3.",
      accent: "oklch(0.72 0.21 142)",
      path: "/spotify",
      Icon: FaSpotify
    },
    {
      id: "pinterest",
      name: "Pinterest",
      description: "Save videos and pins from boards.",
      accent: "oklch(0.55 0.22 25)",
      path: "/pinterest",
      Icon: FaPinterest
    }
  ];

  return (
    <div className="container landing">
      <section className="hero">
        <p className="eyebrow">Multi-platform media toolkit</p>
        <h1 className="hero-title">Media Siphon</h1>
        <p className="hero-subtitle">
          A focused, production-ready downloader that keeps every platform in one clean workspace. Pick a service
          below to get started.
        </p>
      </section>

      <section className="platform-grid">
        {platforms.map((platform) => (
          <Link key={platform.id} to={platform.path} className="platform-link">
            <Card className="platform-card" style={{ "--accent": platform.accent } as CSSProperties}>
              <CardContent className="platform-card-content">
                <div className="platform-badge" style={{ "--accent": platform.accent } as CSSProperties}>
                  <platform.Icon className="platform-icon" aria-hidden={true} />
                </div>
                <div>
                  <h2 className="platform-title">{platform.name}</h2>
                  <p className="platform-desc">{platform.description}</p>
                </div>
                <div className="platform-cta">
                  <Button variant="outline" className="w-full">
                    Open {platform.name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
