import { useState, useMemo, useCallback } from "react";
import { Link as LinkIcon, Download, Upload, Moon, Sun, Plus, Search, Menu, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkCard } from "@/components/LinkCard";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { CollectionsDrawer } from "@/components/CollectionsDrawer";
import { CollectionsSidebar } from "@/components/CollectionsSidebar";
import { Link } from "@/lib/types";
import { getLinks, saveLinks, getCollections, exportLinks, importLinks } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useReminders } from "@/hooks/useReminders";

export default function Index() {
  const [links, setLinks] = useState<Link[]>(getLinks);
  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isDark, setIsDark] = useState(false);
  const { toast } = useToast();
  useReminders(links);

  const persist = useCallback((updated: Link[]) => {
    setLinks(updated);
    saveLinks(updated);
  }, []);

  const collections = useMemo(() => getCollections(links), [links]);
  const collectionNames = useMemo(
    () => [...new Set(links.map((l) => l.collection))],
    [links]
  );
  const favoritesCount = useMemo(() => links.filter((l) => l.isFavorite).length, [links]);

  const filtered = useMemo(() => {
    let result = links;
    if (activeCollection === "__favorites") {
      result = result.filter((l) => l.isFavorite);
    } else if (activeCollection) {
      result = result.filter((l) => l.collection === activeCollection);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)) ||
          l.url.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [links, activeCollection, search]);

  const handleSave = (data: Omit<Link, "id" | "createdAt">) => {
    if (editingLink) {
      persist(links.map((l) => (l.id === editingLink.id ? { ...l, ...data } : l)));
    } else {
      persist([...links, { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
    }
    setEditingLink(null);
  };

  const toggleFavorite = (id: string) =>
    persist(links.map((l) => (l.id === id ? { ...l, isFavorite: !l.isFavorite } : l)));

  const togglePin = (id: string) =>
    persist(links.map((l) => (l.id === id ? { ...l, isPinned: !l.isPinned } : l)));

  const deleteLink = (id: string) => persist(links.filter((l) => l.id !== id));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const srcIdx = result.source.index;
    const destIdx = result.destination.index;
    if (srcIdx === destIdx) return;

    const reordered = Array.from(filtered);
    const [moved] = reordered.splice(srcIdx, 1);
    reordered.splice(destIdx, 0, moved);

    // Assign order to all items in filtered view
    const orderMap = new Map<string, number>();
    reordered.forEach((item, i) => orderMap.set(item.id, i));

    persist(links.map((l) => orderMap.has(l.id) ? { ...l, order: orderMap.get(l.id)! } : l));
  };

  const handleExport = () => {
    const blob = new Blob([exportLinks(links)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "linkstash-export.json";
    a.click();
    toast({ title: "Exported!", description: `${links.length} links exported.` });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const imported = importLinks(reader.result as string);
        if (imported) {
          persist([...links, ...imported.map((l) => ({ ...l, id: crypto.randomUUID() }))]);
          toast({ title: "Imported!", description: `${imported.length} links imported.` });
        } else {
          toast({ title: "Error", description: "Invalid file format.", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const toggleDark = () => {
    setIsDark((v) => !v);
    document.documentElement.classList.toggle("dark");
  };

  const displayTitle = activeCollection === "__favorites" ? "Favorites" : activeCollection || "All Links";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <CollectionsSidebar
        collections={collections}
        activeCollection={activeCollection}
        onSelect={setActiveCollection}
        totalLinks={links.length}
        favoritesCount={favoritesCount}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold font-display text-foreground">LinkStash</h1>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleExport} className="rounded-full p-2 hover:bg-muted transition-colors">
                <Download className="h-5 w-5 text-muted-foreground" />
              </button>
              <button onClick={handleImport} className="rounded-full p-2 hover:bg-muted transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </button>
              <button onClick={toggleDark} className="rounded-full p-2 hover:bg-muted transition-colors">
                {isDark ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 lg:px-8 py-6 pb-24">
          <p className="text-sm text-muted-foreground mb-5">Your personal bookmark manager</p>

          {/* Mobile collections button */}
          <button
            onClick={() => setCollectionsOpen(true)}
            className="lg:hidden mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="h-4 w-4" />
            Collections
          </button>

          {/* Search + Add row */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search links, tags..."
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => { setEditingLink(null); setAddOpen(true); }}
              size="lg"
              className="shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Link
            </Button>
          </div>

          <h2 className="mb-4 text-lg font-bold text-foreground">
            {displayTitle} <span className="font-normal text-muted-foreground">({filtered.length})</span>
          </h2>

          {/* Drag & drop grid */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="links-grid">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {filtered.map((link, index) => (
                    <Draggable key={link.id} draggableId={link.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={snapshot.isDragging ? "opacity-90 shadow-lg rounded-lg" : ""}
                        >
                          <div className="relative group">
                            <div
                              {...provided.dragHandleProps}
                              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hidden md:flex"
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <LinkCard
                              link={link}
                              onToggleFavorite={toggleFavorite}
                              onTogglePin={togglePin}
                              onDelete={deleteLink}
                              onEdit={(l) => { setEditingLink(l); setAddOpen(true); }}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <LinkIcon className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p>No links found</p>
            </div>
          )}
        </main>
      </div>

      <AddLinkDialog
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditingLink(null); }}
        onSave={handleSave}
        editingLink={editingLink}
        collections={collectionNames}
      />

      <CollectionsDrawer
        open={collectionsOpen}
        onClose={() => setCollectionsOpen(false)}
        collections={collections}
        activeCollection={activeCollection}
        onSelect={setActiveCollection}
        totalLinks={links.length}
        favoritesCount={favoritesCount}
      />
    </div>
  );
}
