export function websocketRelativeUrl(path: string) {
   return ((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + path;
}