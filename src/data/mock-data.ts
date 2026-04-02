import { LinkItem, Collection } from "@/types/link";

export const collections: Collection[] = [
  { id: "all", name: "All Links", icon: "layers", count: 8 },
  { id: "dev", name: "Development", icon: "code", count: 3 },
  { id: "design", name: "Design", icon: "palette", count: 2 },
  { id: "reading", name: "Reading List", icon: "book-open", count: 2 },
  { id: "tools", name: "Tools", icon: "wrench", count: 1 },
];

export const mockLinks: LinkItem[] = [
 {
  id: "1",
  title: "My Online Notes",
  url: "https://tushar-notes.lovable.app/",
  description: "A modern developer-focused notes platform that allows users to create, manage, and explore coding notes with syntax-highlighted snippets, search functionality, and gamified learning features.",
  favicon: "https://www.google.com/s2/favicons?sz=64&domain=tushar-notes.lovable.app",
  tags: ["react", "docs"],
  collectionId: "dev",
  createdAt: new Date("2025-11-11"),
  isFavorite: true,
},
  {
  id: "2",
  title: "Tushar Tutorials",
  url: "https://tushar-tutorial.lovable.app/",
  description: "An interactive learning platform where users can explore programming tutorials, structured lessons, and practical examples to improve development skills efficiently.",
  favicon: "https://www.google.com/s2/favicons?sz=64&domain=tushar-tutorial.lovable.app",
  tags: ["tutorial", "learning", "webdev"],
  collectionId: "dev",
  createdAt: new Date("2025-11-12"),
  isFavorite: false,
}
  
];
