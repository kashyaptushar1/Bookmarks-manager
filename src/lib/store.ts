import { Link } from "./types";

const STORAGE_KEY = "linkstash-links";

const defaultLinks: Link[] = [
  {
    id: "1",
    title: "My Online Notes",
    url: "https://tushar-notes.lovable.app/",
    description: "A modern developer-focused notes platform that allows users to create, manage, and explore coding notes with syntax-highlighted snippets, search functionality, and gamified learning features.",
    tags: ["react", "docs"],
    collection: "Development",
    isFavorite: true,
    isPinned: true,
    createdAt: new Date().toISOString(),
  }
];

export function getLinks(): Link[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLinks));
  return defaultLinks;
}

export function saveLinks(links: Link[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return "";
  }
}

export function getCollections(links: Link[]) {
  const map = new Map<string, number>();
  links.forEach((l) => {
    map.set(l.collection, (map.get(l.collection) || 0) + 1);
  });
  const icons: Record<string, string> = {
    Development: "code",
    Design: "palette",
    "Reading List": "book-open",
    Tools: "wrench",
    Favorites: "heart",
  };
  const collections = Array.from(map.entries()).map(([name, count]) => ({
    id: name,
    name,
    icon: icons[name] || "folder",
    count,
  }));
  return collections;
}

export function exportLinks(links: Link[]): string {
  return JSON.stringify(links, null, 2);
}

export function importLinks(json: string): Link[] | null {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}
