export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  tags: string[];
  collectionId: string;
  createdAt: Date;
  isFavorite: boolean;
  remindAt?: Date;
  alarmTime?: string; // "HH:MM" in 24h format
  alarmPeriod?: "AM" | "PM";
  alarmDaily?: boolean;
  isPinned?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  icon: string;
  count: number;
}
