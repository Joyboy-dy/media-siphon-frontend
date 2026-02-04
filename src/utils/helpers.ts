const CLIENT_ID_KEY = "yt_siphon_client_id";

export function getClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);

  if (!id) {
    if (globalThis.crypto && "randomUUID" in globalThis.crypto) {
      id = globalThis.crypto.randomUUID();
    } else {
      id = `client_${Math.random().toString(36).slice(2, 10)}`;
    }

    localStorage.setItem(CLIENT_ID_KEY, id);
  }

  return id;
}

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return "";
  return value.toLocaleString();
}

export function formatDuration(duration: number | undefined | null): string {
  if (duration === undefined || duration === null) return "";
  const minutes = Math.floor(duration / 60);
  const seconds = String(duration % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function formatTime(ts: number | undefined | null): string {
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleTimeString();
}
