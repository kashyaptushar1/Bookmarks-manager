import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/lib/types";
import { fetchUrlMetadata } from "@/lib/fetchMetadata";
import { Loader2 } from "lucide-react";

interface AddLinkDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (link: Omit<Link, "id" | "createdAt">) => void;
  editingLink?: Link | null;
  collections: string[];
}

export function AddLinkDialog({ open, onClose, onSave, editingLink, collections }: AddLinkDialogProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [collection, setCollection] = useState("Development");
  const [reminder, setReminder] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title);
      setUrl(editingLink.url);
      setDescription(editingLink.description);
      setTags(editingLink.tags.join(", "));
      setCollection(editingLink.collection);
      setReminder(editingLink.reminder ? editingLink.reminder.slice(0, 16) : "");
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
      setTags("");
      setCollection(collections[0] || "Development");
      setReminder("");
    }
  }, [editingLink, open, collections]);

  const autoFetch = useCallback(async (inputUrl: string) => {
    if (!inputUrl.trim() || editingLink) return;
    const formatted = inputUrl.trim().startsWith("http") ? inputUrl.trim() : `https://${inputUrl.trim()}`;
    try {
      new URL(formatted);
    } catch {
      return;
    }

    setIsFetching(true);
    const meta = await fetchUrlMetadata(formatted);
    setIsFetching(false);

    if (meta) {
      if (meta.title && !title) setTitle(meta.title);
      if (meta.description && !description) setDescription(meta.description);
    }
  }, [editingLink, title, description]);

  const handleUrlBlur = () => {
    autoFetch(url);
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    // Small delay to let React update the input value
    setTimeout(() => autoFetch(pasted), 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    onSave({
      title: title.trim(),
      url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
      description: description.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      collection,
      isFavorite: editingLink?.isFavorite || false,
      isPinned: editingLink?.isPinned || false,
      reminder: reminder ? new Date(reminder).toISOString() : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingLink ? "Edit Link" : "Add New Link"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url">URL</Label>
            <div className="relative">
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                onPaste={handleUrlPaste}
                placeholder="https://example.com"
                required
              />
              {isFetching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {isFetching && (
              <p className="text-xs text-muted-foreground mt-1">Fetching page info…</p>
            )}
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My cool link" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={3} />
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="work, dev, reading" />
          </div>
          <div>
            <Label htmlFor="reminder">Reminder</Label>
            <Input
              id="reminder"
              type="datetime-local"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="block"
            />
          </div>
          <div>
            <Label htmlFor="collection">Collection</Label>
            <select
              id="collection"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {collections.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__new">+ New collection</option>
            </select>
          </div>
          {collection === "__new" && (
            <div>
              <Label htmlFor="newCollection">New Collection Name</Label>
              <Input
                id="newCollection"
                onChange={(e) => setCollection(e.target.value)}
                placeholder="My Collection"
              />
            </div>
          )}
          <Button type="submit" className="w-full" size="lg">
            {editingLink ? "Save Link" : "Save Link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
