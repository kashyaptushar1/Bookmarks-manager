import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LinkCard } from "@/components/LinkCard";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { CollectionSidebar } from "@/components/CollectionSidebar";
import { collections as initialCollections } from "@/data/mock-data";
import { LinkItem } from "@/types/link";
import { usePersistedLinks } from "@/hooks/usePersistedLinks";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [links, setLinks] = usePersistedLinks();
  const [activeCollection, setActiveCollection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const firedReminders = useRef<Set<string>>(new Set());

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        console.log("Notification permission:", perm);
      });
    }
  }, []);

  // Register Service Worker (skip in iframes/preview)
  useEffect(() => {
    const isInIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    const isPreview = window.location.hostname.includes("id-preview--") || window.location.hostname.includes("lovableproject.com");

    if (isInIframe || isPreview) {
      // Unregister any existing SW in preview
      navigator.serviceWorker?.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        console.log("SW registered", reg.scope);
      });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLinks((prevLinks) => {
        let updated = false;
        const newLinks = prevLinks.map((link) => {
          if (
            link.remindAt &&
            new Date(link.remindAt) <= now &&
            !firedReminders.current.has(link.id + "-" + link.remindAt)
          ) {
            firedReminders.current.add(link.id + "-" + link.remindAt);

            // Fire browser notification via SW registration
            if ("Notification" in window && Notification.permission === "granted") {
              navigator.serviceWorker?.ready.then((reg) => {
                reg.showNotification(`⏰ ${link.title}`, {
                  body: link.description || `Time to open: ${link.url}`,
                  icon: "/placeholder.svg",
                  tag: link.id,
                  data: { url: link.url },
                  requireInteraction: true,
                });
              }).catch(() => {
                // Fallback to basic notification
                new Notification(`⏰ ${link.title}`, {
                  body: link.description || `Time to open: ${link.url}`,
                  tag: link.id,
                });
              });
            }

            // Also show in-app toast
            toast(`⏰ Alarm: "${link.title}"`, {
              description: link.description || link.url,
              action: {
                label: "Open Link",
                onClick: () => window.open(link.url, "_blank"),
              },
              duration: 30000,
            });

            // If daily, schedule next alarm for tomorrow
            if (link.alarmDaily && link.alarmTime && link.alarmPeriod) {
              const [h, m] = link.alarmTime.split(":").map(Number);
              let hour24 = h;
              if (link.alarmPeriod === "AM" && hour24 === 12) hour24 = 0;
              if (link.alarmPeriod === "PM" && hour24 !== 12) hour24 += 12;

              const nextAlarm = new Date();
              nextAlarm.setDate(nextAlarm.getDate() + 1);
              nextAlarm.setHours(hour24, m, 0, 0);

              updated = true;
              return { ...link, remindAt: nextAlarm };
            }

            // One-time alarm: clear it
            updated = true;
            return { ...link, remindAt: undefined };
          }
          return link;
        });
        return updated ? newLinks : prevLinks;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const collections = useMemo(() => {
    return initialCollections.map((c) => ({
      ...c,
      count:
        c.id === "all"
          ? links.length
          : links.filter((l) => l.collectionId === c.id).length,
    }));
  }, [links]);

  const favoriteCount = links.filter((l) => l.isFavorite).length;

  const filteredLinks = useMemo(() => {
    let result = links;
    if (showFavorites) {
      result = result.filter((l) => l.isFavorite);
    } else if (activeCollection !== "all") {
      result = result.filter((l) => l.collectionId === activeCollection);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    // Sort: pinned first, then by creation date
    return [...result].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [links, activeCollection, searchQuery, showFavorites]);

  const handleAdd = (link: LinkItem) => {
    setLinks((prev) => [link, ...prev]);
    // Schedule alarm in service worker
    if (link.remindAt && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SCHEDULE_ALARM",
        id: link.id,
        title: link.title,
        description: link.description,
        url: link.url,
        remindAt: link.remindAt,
      });
    }
  };

  const handleToggleFavorite = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFavorite: !l.isFavorite } : l))
    );
  };

  const handleDelete = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleEdit = (updated: LinkItem) => {
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleTogglePin = (id: string) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, isPinned: !l.isPinned } : l)));
  };

  const activeTitle = showFavorites
    ? "Favorites"
    : collections.find((c) => c.id === activeCollection)?.name || "All Links";

  return (
    <div className="flex min-h-screen bg-background">
      <CollectionSidebar
        collections={collections}
        activeId={activeCollection}
        onSelect={setActiveCollection}
        showFavorites={showFavorites}
        onToggleFavorites={() => setShowFavorites((f) => !f)}
        favoriteCount={favoriteCount}
      />

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <LinkIcon className="h-6 w-6 text-primary" />
            <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
              LinkStash
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Your personal bookmark manager
        </p>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search links, tags..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AddLinkDialog activeCollection={activeCollection} onAdd={handleAdd} />
        </div>

        {/* Section title */}
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          {activeTitle}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({filteredLinks.length})
          </span>
        </h2>

        {/* Links Grid */}
        {filteredLinks.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <LinkIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "No links match your search" : "No links yet. Add your first one!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
