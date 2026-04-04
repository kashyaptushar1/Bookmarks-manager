export interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  collection: string;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  favicon?: string;
  reminder?: string; // ISO datetime string
  order?: number; // manual sort order for drag & drop
}

export interface Collection {
  id: string;
  name: string;
  icon: string;
  count: number;
}
