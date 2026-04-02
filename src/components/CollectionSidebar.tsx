import { Layers, Code, Palette, BookOpen, Wrench, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collection } from "@/types/link";

const iconMap: Record<string, React.ElementType> = {
  layers: Layers,
  code: Code,
  palette: Palette,
  "book-open": BookOpen,
  wrench: Wrench,
};

interface CollectionSidebarProps {
  collections: Collection[];
  activeId: string;
  onSelect: (id: string) => void;
  showFavorites: boolean;
  onToggleFavorites: () => void;
  favoriteCount: number;
}

export function CollectionSidebar({
  collections,
  activeId,
  onSelect,
  showFavorites,
  onToggleFavorites,
  favoriteCount,
}: CollectionSidebarProps) {
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-sidebar p-4 hidden md:block">
      <h2 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Collections
      </h2>
      <nav className="space-y-1">
        {collections.map((col) => {
          const Icon = iconMap[col.icon] || Layers;
          const isActive = !showFavorites && activeId === col.id;
          return (
            <button
              key={col.id}
              onClick={() => {
                onSelect(col.id);
                if (showFavorites) onToggleFavorites();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{col.name}</span>
              <span className="text-xs text-muted-foreground">{col.count}</span>
            </button>
          );
        })}

        <div className="my-3 border-t border-border" />

        <button
          onClick={onToggleFavorites}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
            showFavorites
              ? "bg-accent/10 text-accent font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        >
          <Heart className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Favorites</span>
          <span className="text-xs text-muted-foreground">{favoriteCount}</span>
        </button>
      </nav>
    </aside>
  );
}
