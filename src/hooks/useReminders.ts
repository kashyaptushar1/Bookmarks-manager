import { useEffect, useRef } from "react";
import { Link } from "@/lib/types";

const NOTIFICATION_SOUND_URL = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

function playNotificationSound() {
  try {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {}
}

export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function useReminders(links: Link[]) {
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      links.forEach((link) => {
        if (
          link.reminder &&
          !firedRef.current.has(link.id) &&
          new Date(link.reminder).getTime() <= now
        ) {
          firedRef.current.add(link.id);
          playNotificationSound();
          if ("Notification" in window && Notification.permission === "granted") {
            const notification = new Notification("LinkStash Reminder", {
              body: `Reminder: ${link.title}\n${link.url}`,
              icon: "/placeholder.svg",
              requireInteraction: true,
            });
            notification.onclick = () => {
              window.open(link.url, "_blank");
              notification.close();
            };
          }
        }
      });
    };

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [links]);
}
