import { useSyncExternalStore } from "react";

function readHash(): string {
  const h = window.location.hash.replace(/^#/, "");
  return h.startsWith("/") ? h : `/${h}`;
}

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

export function useRoute(): string {
  const hash = useSyncExternalStore(subscribe, readHash);
  return hash;
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function useNavigate(): (path: string) => void {
  return navigate;
}
