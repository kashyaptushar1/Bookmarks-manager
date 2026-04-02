import { useState } from "react";
import { ExternalLink, Heart, MoreHorizontal, Trash2, Bell, Repeat, Pencil, Copy, Pin } from "lucide-react";
import { LinkItem } from "@/types/link";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditLinkDialog } from "@/components/EditLinkDialog";

interface LinkCardProps {
  link: LinkItem;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (updated: LinkItem) => void;
  onTogglePin: (id: string) => void;
}

export function LinkCard({ link, onToggleFavorite, onDelete, onEdit, onTogglePin }: LinkCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const domain = new URL(link.url).hostname.replace("www.", "");

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(link.url);
    toast.success("URL copied to clipboard!");
  };

  return (
    <>
      <div className={`group rounded-lg border bg-card p-4 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-primary/20 animate-fade-in ${link.isPinned ? "border-primary/40 ring-1 ring-primary/20" : "border-border"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
              {link.favicon ? (
                <img src={link.favicon} alt="" className="h-4 w-4 rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-heading text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                {link.title}
              </a>
              <p className="mt-0.5 text-xs text-muted-foreground">{domain}</p>
              {link.isPinned && (
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-primary">
                  <Pin className="h-2.5 w-2.5" /> Pinned
                </p>
              )}
              {link.alarmTime && link.alarmPeriod && (
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-primary">
                  <Bell className="h-3 w-3" />
                  {link.alarmTime} {link.alarmPeriod}
                  {link.alarmDaily && (
                    <span className="flex items-center gap-0.5 text-accent">
                      <Repeat className="h-2.5 w-2.5" /> Daily
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onToggleFavorite(link.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-accent">
              <Heart className={`h-3.5 w-3.5 ${link.isFavorite ? "fill-accent text-accent" : ""}`} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyUrl}>
                  <Copy className="mr-2 h-3.5 w-3.5" /> Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTogglePin(link.id)}>
                  <Pin className="mr-2 h-3.5 w-3.5" /> {link.isPinned ? "Unpin" : "Pin to Top"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {link.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{link.description}</p>
        )}

        {link.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {link.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] font-medium px-2 py-0.5">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this link?</AlertDialogTitle>
            <AlertDialogDescription>
              "{link.title}" will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onDelete(link.id); toast.success("Link deleted"); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditLinkDialog link={link} open={showEditDialog} onOpenChange={setShowEditDialog} onSave={onEdit} />
    </>
  );
}
