"use client";

import { useState, useEffect } from "react";
import { Bell, X, Mic, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeetingReminderProps {
  onStartRecording: (title: string) => void;
}

export function MeetingReminder({ onStartRecording }: MeetingReminderProps) {
  const [upcomingMeeting, setUpcomingMeeting] = useState<{
    title: string;
    startsIn: number; // minutes
    platform?: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Check for upcoming meetings
  useEffect(() => {
    const checkMeetings = async () => {
      try {
        const res = await fetch("/api/calendar/events");
        if (res.ok) {
          const data = await res.json();
          const now = Date.now();
          
          // Find meeting starting within 15 minutes
          for (const event of data.events) {
            const startTime = new Date(event.start).getTime();
            const diff = startTime - now;
            const minutesUntil = Math.floor(diff / 60000);
            
            if (minutesUntil > 0 && minutesUntil <= 15) {
              setUpcomingMeeting({
                title: event.title,
                startsIn: minutesUntil,
                platform: event.platform,
              });
              setDismissed(false);
              
              // Show browser notification if enabled
              if (notificationsEnabled && Notification.permission === "granted") {
                new Notification("Meeting Starting Soon!", {
                  body: `${event.title} starts in ${minutesUntil} minutes`,
                  icon: "/icons/icon128.png",
                });
              }
              return;
            }
            
            // Meeting is now
            if (minutesUntil <= 0 && minutesUntil > -30) {
              setUpcomingMeeting({
                title: event.title,
                startsIn: 0,
                platform: event.platform,
              });
              setDismissed(false);
              return;
            }
          }
          
          setUpcomingMeeting(null);
        }
      } catch (error) {
        console.error("Failed to check meetings:", error);
      }
    };

    checkMeetings();
    const interval = setInterval(checkMeetings, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  // Request notification permission
  const enableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        new Notification("Notifications Enabled!", {
          body: "You'll be reminded when meetings are about to start.",
        });
      }
    }
  };

  if (!upcomingMeeting || dismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        {!notificationsEnabled && "Notification" in window && (
          <Button
            size="sm"
            variant="outline"
            className="shadow-lg bg-white"
            onClick={enableNotifications}
          >
            <Bell className="w-4 h-4 mr-2" />
            Enable Reminders
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white border shadow-xl rounded-xl p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            upcomingMeeting.startsIn === 0 
              ? "bg-red-100 animate-pulse" 
              : "bg-yellow-100"
          }`}>
            {upcomingMeeting.startsIn === 0 ? (
              <Mic className="w-6 h-6 text-red-600" />
            ) : (
              <Clock className="w-6 h-6 text-yellow-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">
              {upcomingMeeting.startsIn === 0 
                ? "Meeting Started!" 
                : "Meeting Soon"}
            </h3>
            <p className="text-sm font-medium mt-1">{upcomingMeeting.title}</p>
            <p className="text-sm text-muted-foreground">
              {upcomingMeeting.startsIn === 0 
                ? "Your meeting is happening now" 
                : `Starts in ${upcomingMeeting.startsIn} minute${upcomingMeeting.startsIn > 1 ? "s" : ""}`}
              {upcomingMeeting.platform && ` • ${upcomingMeeting.platform}`}
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                className="bg-red-500 hover:bg-red-600"
                onClick={() => onStartRecording(upcomingMeeting.title)}
              >
                <Mic className="w-4 h-4 mr-1" />
                Start Recording
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setDismissed(true)}
              >
                Later
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={() => setDismissed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
