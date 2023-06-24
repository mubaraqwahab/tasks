import { usePage } from "@inertiajs/react";
import { FormEvent, useEffect, useState } from "react";
import { PageProps } from "./types";

export function truncate(str: string, maxLen: number) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

export const NONEMPTY_WHEN_TRIMMED_PATTERN = String.raw`\s*\S(.*\S)?\s*`;

export const TASK_CHANGELOG_STORAGE_KEY = "taskChangelog";

export function useAuth() {
  const page = usePage<PageProps>();
  return page.props.auth;
}

export function useOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
