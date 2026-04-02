import { useState } from "react";
import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface AddLinkDialogProps {
  activeCollection: string;
  onAdd: (link: LinkItem) => void;
}

function getNextAlarmDate(hour: number, minute: number, period: "AM" | "PM"): Date {
  let h = hour;
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;

  const now = new Date();
  const alarm = new Date();
  alarm.setHours(h, minute, 0, 0);

  // If the time already passed today, set for tomorrow
  if (alarm <= now) {
    alarm.setDate(alarm.getDate() + 1);
  }
  return alarm;
}

export function AddLinkDialog({ activeCollection, onAdd }: AddLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  // Alarm fields
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmHour, setAlarmHour] = useState("9");
  const [alarmMinute, setAlarmMinute] = useState("00");
  const [alarmPeriod, setAlarmPeriod] = useState<"AM" | "PM">("AM");
  const [alarmDaily, setAlarmDaily] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    const hour = parseInt(alarmHour);
    const minute = parseInt(alarmMinute);

    const newLink: LinkItem = {
      id: Date.now().toString(),
      title,
      url: url.startsWith("http") ? url : `https://${url}`,
      description: description || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      collectionId: activeCollection === "all" ? "dev" : activeCollection,
      createdAt: new Date(),
      isFavorite: false,
      remindAt: alarmEnabled ? getNextAlarmDate(hour, minute, alarmPeriod) : undefined,
      alarmTime: alarmEnabled ? `${alarmHour}:${alarmMinute.padStart(2, "0")}` : undefined,
      alarmPeriod: alarmEnabled ? alarmPeriod : undefined,
      alarmDaily: alarmEnabled ? alarmDaily : undefined,
    };

    onAdd(newLink);
    setTitle("");
    setUrl("");
    setDescription("");
    setTags("");
    setAlarmEnabled(false);
    setAlarmHour("9");
    setAlarmMinute("00");
    setAlarmPeriod("AM");
    setAlarmDaily(false);
    setOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Add New Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="My awesome link"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="react, tutorial, docs"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Alarm Section */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <Label htmlFor="alarm-toggle" className="text-sm font-medium cursor-pointer">
                  Set Alarm Reminder
                </Label>
              </div>
              <Switch
                id="alarm-toggle"
                checked={alarmEnabled}
                onCheckedChange={setAlarmEnabled}
              />
            </div>

            {alarmEnabled && (
              <div className="space-y-3 pt-1">
                {/* Time Picker */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Hour</Label>
                    <Select value={alarmHour} onValueChange={setAlarmHour}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-lg font-bold text-muted-foreground mt-5">:</span>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Min</Label>
                    <Select value={alarmMinute} onValueChange={setAlarmMinute}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Period</Label>
                    <Select value={alarmPeriod} onValueChange={(v) => setAlarmPeriod(v as "AM" | "PM")}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Daily Repeat */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily-toggle" className="text-xs text-muted-foreground cursor-pointer">
                    Repeat daily (remind me every day)
                  </Label>
                  <Switch
                    id="daily-toggle"
                    checked={alarmDaily}
                    onCheckedChange={setAlarmDaily}
                  />
                </div>

                <p className="text-[10px] text-muted-foreground">
                  ⏰ Alarm set for {alarmHour}:{alarmMinute.padStart(2, "0")} {alarmPeriod}
                  {alarmDaily ? " — every day" : " — once"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Link</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
