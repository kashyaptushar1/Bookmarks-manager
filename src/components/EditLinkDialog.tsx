import { useState, useEffect } from "react";
import { Bell, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LinkItem } from "@/types/link";

interface EditLinkDialogProps {
  link: LinkItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: LinkItem) => void;
}

function getNextAlarmDate(hour: number, minute: number, period: "AM" | "PM"): Date {
  let h = hour;
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  const now = new Date();
  const alarm = new Date();
  alarm.setHours(h, minute, 0, 0);
  if (alarm <= now) alarm.setDate(alarm.getDate() + 1);
  return alarm;
}

export function EditLinkDialog({ link, open, onOpenChange, onSave }: EditLinkDialogProps) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [description, setDescription] = useState(link.description || "");
  const [tags, setTags] = useState(link.tags.join(", "));

  const [alarmEnabled, setAlarmEnabled] = useState(!!link.alarmTime);
  const [alarmHour, setAlarmHour] = useState(link.alarmTime?.split(":")[0] || "9");
  const [alarmMinute, setAlarmMinute] = useState(link.alarmTime?.split(":")[1] || "00");
  const [alarmPeriod, setAlarmPeriod] = useState<"AM" | "PM">(link.alarmPeriod || "AM");
  const [alarmDaily, setAlarmDaily] = useState(link.alarmDaily || false);

  useEffect(() => {
    setTitle(link.title);
    setUrl(link.url);
    setDescription(link.description || "");
    setTags(link.tags.join(", "));
    setAlarmEnabled(!!link.alarmTime);
    setAlarmHour(link.alarmTime?.split(":")[0] || "9");
    setAlarmMinute(link.alarmTime?.split(":")[1] || "00");
    setAlarmPeriod(link.alarmPeriod || "AM");
    setAlarmDaily(link.alarmDaily || false);
  }, [link]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    const hour = parseInt(alarmHour);
    const minute = parseInt(alarmMinute);

    const updated: LinkItem = {
      ...link,
      title,
      url: url.startsWith("http") ? url : `https://${url}`,
      description: description || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      remindAt: alarmEnabled ? getNextAlarmDate(hour, minute, alarmPeriod) : undefined,
      alarmTime: alarmEnabled ? `${alarmHour}:${alarmMinute.padStart(2, "0")}` : undefined,
      alarmPeriod: alarmEnabled ? alarmPeriod : undefined,
      alarmDaily: alarmEnabled ? alarmDaily : undefined,
    };

    onSave(updated);
    onOpenChange(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Edit Link
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-url">URL</Label>
            <Input id="edit-url" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
            <Input id="edit-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <Label htmlFor="edit-alarm" className="text-sm font-medium cursor-pointer">Alarm Reminder</Label>
              </div>
              <Switch id="edit-alarm" checked={alarmEnabled} onCheckedChange={setAlarmEnabled} />
            </div>
            {alarmEnabled && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Hour</Label>
                    <Select value={alarmHour} onValueChange={setAlarmHour}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{hours.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <span className="text-lg font-bold text-muted-foreground mt-5">:</span>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Min</Label>
                    <Select value={alarmMinute} onValueChange={setAlarmMinute}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{minutes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Period</Label>
                    <Select value={alarmPeriod} onValueChange={(v) => setAlarmPeriod(v as "AM" | "PM")}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-daily" className="text-xs text-muted-foreground cursor-pointer">Repeat daily</Label>
                  <Switch id="edit-daily" checked={alarmDaily} onCheckedChange={setAlarmDaily} />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
