import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import { getClientId, formatDuration, formatTime } from "../utils/helpers";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card, CardContent } from "./ui/Card";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const FORMAT_OPTIONS = {
  mp4: {
    label: "MP4 Video",
    qualities: ["best", "1080p", "720p", "480p", "360p"]
  },
  mp3: {
    label: "MP3 Audio",
    qualities: ["best", "high", "medium", "low"]
  },
  wav: {
    label: "WAV Audio",
    qualities: ["best"]
  }
} as const;

type FormatKey = keyof typeof FORMAT_OPTIONS;

type TaskStatus = "queued" | "downloading" | "postprocessing" | "done" | "error" | string;

type Task = {
  id: string;
  url: string;
  format: string;
  status: TaskStatus;
  percent: number;
  timestamp: number;
  platform?: string;
  filename_actual?: string;
  message?: string;
};

type VideoInfo = {
  title: string;
  uploader: string;
  duration?: number;
  duration_string?: string;
  thumbnail?: string;
};

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  downloading: "Downloading",
  postprocessing: "Processing",
  done: "Done",
  error: "Error"
};

type Props = {
  platform: "youtube" | "instagram" | "tiktok" | "spotify" | "pinterest";
  accentColor: string;
  title: string;
};

export default function Downloader({ platform, accentColor, title }: Props) {
  const clientId = useMemo(() => getClientId(), []);

  const [url, setUrl] = useState("");
  const availableFormats = useMemo<FormatKey[]>(() => {
    if (platform === "spotify") return ["mp3", "wav"];
    return Object.keys(FORMAT_OPTIONS) as FormatKey[];
  }, [platform]);

  const [format, setFormat] = useState<FormatKey>(() => (platform === "spotify" ? "mp3" : "mp4"));
  const [quality, setQuality] = useState("best");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [infoLoading, setInfoLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Ref to track polling interval
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (!availableFormats.includes(format)) {
      setFormat(availableFormats[0]);
    }
  }, [availableFormats, format]);

  useEffect(() => {
    const allowed = FORMAT_OPTIONS[format];
    if (!(allowed.qualities as readonly string[]).includes(quality)) {
      setQuality(allowed.qualities[0]);
    }
  }, [format, quality]);

  // Helper to check if there are active tasks
  const hasActiveTasks = useCallback((taskList: Task[]) => {
    return taskList.some(
      (task) => task.status === "downloading" || task.status === "queued" || task.status === "postprocessing"
    );
  }, []);

  // Start polling function
  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/tasks?client_id=${clientId}`);
        if (!response.ok) return;
        const data = (await response.json()) as { tasks?: Task[] };
        const newTasks = data.tasks || [];
        setTasks(newTasks);

        // Stop polling if no more active tasks
        if (!hasActiveTasks(newTasks)) {
          stopPolling();
        }
      } catch {
        // ignore
      }
    }, 2500);
  }, [clientId, hasActiveTasks]);

  // Stop polling function
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Initial fetch on mount (once)
  useEffect(() => {
    void fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTasks() {
    try {
      const response = await fetch(`${API_BASE}/api/tasks?client_id=${clientId}`);
      if (!response.ok) return;
      const data = (await response.json()) as { tasks?: Task[] };
      const newTasks = data.tasks || [];
      setTasks(newTasks);
      // If there are active tasks, start polling
      if (hasActiveTasks(newTasks) && !isPollingRef.current) {
        startPolling();
      }
    } catch {
      // ignore
    }
  }

  async function fetchVideoInfo(event?: FormEvent) {
    if (event) event.preventDefault();
    setError("");
    setVideoInfo(null);

    if (!url) {
      setError("Please enter a URL.");
      return;
    }

    setInfoLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/video-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Id": clientId
        },
        body: JSON.stringify({ url, client_id: clientId })
      });

      const data = (await response.json()) as VideoInfo & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch video info.");
      }

      setVideoInfo(data);
    } catch (err) {
      setError((err as Error).message || "Unexpected error.");
    } finally {
      setInfoLoading(false);
    }
  }

  async function startDownload() {
    setError("");

    if (!url) {
      setError("Please enter a URL.");
      return;
    }

    setDownloadLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Id": clientId
        },
        body: JSON.stringify({
          url,
          format,
          quality,
          client_id: clientId
        })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to start download.");
      }

      // Fetch tasks immediately and start polling
      await fetchTasks();
      startPolling();
    } catch (err) {
      setError((err as Error).message || "Unexpected error.");
    } finally {
      setDownloadLoading(false);
    }
  }

  const filteredTasks = tasks.filter((task) => !task.platform || task.platform === platform);

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/" className="back-button" aria-label="Back to platforms">
          <FiArrowLeft aria-hidden={true} focusable={false} />
          <span>Back to platforms</span>
        </Link>

        <div className="page-meta">
          <span className="page-eyebrow">{title}</span>
          <h1 className="page-title" style={{ color: accentColor }}>
            {title} Downloader
          </h1>
        </div>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={fetchVideoInfo} className="download-form">
            <Input
              placeholder={`Paste your ${title} link here...`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button type="submit" disabled={infoLoading}>
              {infoLoading ? "Checking..." : "Check"}
            </Button>
          </form>

          {error && <div className="inline-alert">{error}</div>}

          {videoInfo && (
            <div className="video-panel">
              <div className="video-thumb">
                {videoInfo.thumbnail ? (
                  <img src={videoInfo.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div>No Img</div>
                )}
              </div>
              <div className="video-info">
                <div className="video-title" title={videoInfo.title}>
                  {videoInfo.title}
                </div>
                <div className="video-meta">
                  {(() => {
                    const durationText = videoInfo.duration_string || formatDuration(videoInfo.duration);
                    return [videoInfo.uploader, durationText].filter(Boolean).join(" - ");
                  })()}
                </div>
              </div>
            </div>
          )}

          <div className="form-grid">
            <div>
              <label className="field-label">Format</label>
              <div className="segmented" role="group" aria-label="Format">
                {availableFormats.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormat(key)}
                    className={`segment ${format === key ? "segment-active" : ""}`}
                  >
                    {key.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Quality</label>
              <select value={quality} onChange={(e) => setQuality(e.target.value)}>
                {FORMAT_OPTIONS[format].qualities.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            className="download-cta"
            size="lg"
            onClick={startDownload}
            disabled={downloadLoading || !videoInfo}
            style={{ backgroundColor: accentColor, color: "oklch(0.98 0.01 85)" }}
          >
            {downloadLoading ? "Starting Download..." : platform === "spotify" ? "Download Audio" : "Download Media"}
          </Button>
        </CardContent>
      </Card>

      <div className="task-list" style={{ marginTop: "1.5rem" }}>
        {filteredTasks.map((task) => (
          <div key={task.id} className="task-item">
            <div className="task-info">
              <div className="task-title">{task.filename_actual || task.url}</div>
              <div className="task-meta">
                {(STATUS_LABELS[task.status] || task.status).toUpperCase()} - {task.format} - {formatTime(task.timestamp)}
                {task.status === "error" && task.message ? ` - ${task.message}` : ""}
              </div>
              {task.percent > 0 && task.status === "downloading" && (
                <div className="progress-track" aria-label="Download progress">
                  <div className="progress-bar" style={{ width: `${task.percent}%` }} />
                </div>
              )}
            </div>

            <div>
              {task.status === "done" ? (
                <a href={`${API_BASE}/api/download/${task.id}?client_id=${clientId}`} className="btn btn-secondary btn-sm">
                  Download
                </a>
              ) : (
                <span className="status-pill">{STATUS_LABELS[task.status] || task.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
