import { Layers, Code, Palette, BookOpen, Wrench, Heart, Folder } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface CollectionsSidebarProps {
  collections: Collection[];
  activeCollection: string | null;
  onSelect: (name: string | null) => void;
  totalLinks: number;
  favoritesCount: number;
}

const iconMap: Record<string, React.ElementType> = {
  code: Code,
  palette: Palette,
  "book-open": BookOpen,
  wrench: Wrench,
  heart: Heart,
  folder: Folder,
};

export function CollectionsSidebar({
  collections,
  activeCollection,
  onSelect,
  totalLinks,
  favoritesCount,
}: CollectionsSidebarProps) {
  const items = [
    { key: null, label: "All Links", icon: Layers, count: totalLinks },
    ...collections.map((col) => ({
      key: col.name,
      label: col.name,
      icon: iconMap[col.icon] || Folder,
      count: col.count,
    })),
    { key: "__favorites", label: "Favorites", icon: Heart, count: favoritesCount },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-sidebar min-h-screen sticky top-0">
      <div className="px-5 pt-6 pb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Collections
        </h2>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.key === activeCollection ||
            (item.key === null && activeCollection === null);
          return (
            <button
              key={item.key ?? "__all"}
              onClick={() => onSelect(item.key)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <span className="text-xs text-muted-foreground">{item.count}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
