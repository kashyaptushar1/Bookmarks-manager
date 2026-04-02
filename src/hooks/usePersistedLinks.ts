import { useState, useEffect, useCallback } from "react";
import { LinkItem } from "@/types/link";
import { mockLinks } from "@/data/mock-data";

const STORAGE_KEY = "linkstash-links";

function loadLinks(): LinkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((l: any) => ({
        ...l,
        createdAt: new Date(l.createdAt),
        remindAt: l.remindAt ? new Date(l.remindAt) : undefined,
      }));
    }
  } catch {
    // ignore parse errors
  }
  return mockLinks;
}

function saveLinks(links: LinkItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export function usePersistedLinks() {
  const [links, setLinksState] = useState<LinkItem[]>(loadLinks);

  const setLinks: typeof setLinksState = useCallback((action) => {
    setLinksState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      saveLinks(next);
      return next;
    });
  }, []);

  return [links, setLinks] as const;
}
