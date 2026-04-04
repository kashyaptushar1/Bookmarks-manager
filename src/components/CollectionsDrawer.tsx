import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Layers, Code, Palette, BookOpen, Wrench, Heart, Folder } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface CollectionsDrawerProps {
  open: boolean;
  onClose: () => void;
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

export function CollectionsDrawer({
  open,
  onClose,
  collections,
  activeCollection,
  onSelect,
  totalLinks,
  favoritesCount,
}: CollectionsDrawerProps) {
  const handleSelect = (name: string | null) => {
    onSelect(name);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle>Collections</SheetTitle>
        </SheetHeader>
        <div className="space-y-1">
          <button
            onClick={() => handleSelect(null)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors ${
              activeCollection === null ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-muted"
            }`}
          >
            <span className="flex items-center gap-3">
              <Layers className="h-5 w-5" />
              All Links
            </span>
            <span className="text-sm text-muted-foreground">{totalLinks}</span>
          </button>

          {collections.map((col) => {
            const Icon = iconMap[col.icon] || Folder;
            return (
              <button
                key={col.id}
                onClick={() => handleSelect(col.name)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors ${
                  activeCollection === col.name ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-muted"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  {col.name}
                </span>
                <span className="text-sm text-muted-foreground">{col.count}</span>
              </button>
            );
          })}

          <button
            onClick={() => handleSelect("__favorites")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors ${
              activeCollection === "__favorites" ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-muted"
            }`}
          >
            <span className="flex items-center gap-3">
              <Heart className="h-5 w-5" />
              Favorites
            </span>
            <span className="text-sm text-muted-foreground">{favoritesCount}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
