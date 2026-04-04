import { Heart, MoreHorizontal, Pin, ExternalLink, Trash2, Edit, Bell } from "lucide-react";
import { Link } from "@/lib/types";
import { getDomain, getFaviconUrl } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LinkCardProps {
  link: Link;
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (link: Link) => void;
}

export function LinkCard({ link, onToggleFavorite, onTogglePin, onDelete, onEdit }: LinkCardProps) {
  return (
    <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30 animate-fade-in">
      <div className="flex items-start gap-3">
        <img
          src={getFaviconUrl(link.url)}
          alt=""
          className="mt-1 h-8 w-8 rounded-md bg-muted p-1"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-card-foreground truncate block hover:text-primary transition-colors cursor-pointer"
              >
                {link.title}
              </a>
              <p className="text-sm text-muted-foreground">{getDomain(link.url)}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {link.isPinned && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-pinned">
                    <Pin className="h-3 w-3" /> Pinned
                  </span>
                )}
                {link.reminder && new Date(link.reminder) > new Date() && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Bell className="h-3 w-3" /> {new Date(link.reminder).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onToggleFavorite(link.id)}
                className="rounded-full p-1.5 transition-colors hover:bg-muted"
              >
                <Heart
                  className={`h-4 w-4 ${link.isFavorite ? "fill-favorite text-favorite" : "text-muted-foreground"}`}
                />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full p-1.5 transition-colors hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.open(link.url, "_blank")}>
                    <ExternalLink className="mr-2 h-4 w-4" /> Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(link)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTogglePin(link.id)}>
                    <Pin className="mr-2 h-4 w-4" /> {link.isPinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(link.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {link.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{link.description}</p>
          )}
          {link.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {link.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-tag px-2.5 py-0.5 text-xs font-medium text-tag-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
