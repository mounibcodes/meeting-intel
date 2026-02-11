"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Video, Mic, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  meetingLink?: string;
  platform?: string;
}

interface UpcomingMeetingsProps {
  onStartRecording: (title: string) => void;
}

export function UpcomingMeetings({ onStartRecording }: UpcomingMeetingsProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if Google Calendar is connected
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const res = await fetch("/api/calendar/status");
      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.connected);
        if (data.connected) {
          fetchEvents();
        }
      }
    } catch (error) {
      console.error("Failed to check calendar connection:", error);
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/calendar/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events.map((e: { id: string; title: string; start: string; end: string; meetingLink?: string; platform?: string }) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        })));
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectCalendar = () => {
    window.location.href = "/api/calendar/connect";
  };

  const detectPlatform = (link?: string): string | undefined => {
    if (!link) return undefined;
    if (link.includes("meet.google.com")) return "Google Meet";
    if (link.includes("zoom.us")) return "Zoom";
    if (link.includes("teams.microsoft.com")) return "Teams";
    return "Video Call";
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <CardTitle>Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4 text-sm">
              Connect your calendar to see upcoming meetings and get recording reminders.
            </p>
            <Button onClick={connectCalendar} className="w-full">
              Connect Google Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <CardTitle>Upcoming Meetings</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchEvents} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-4 text-sm">
            No upcoming meetings today
          </p>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => {
              const platform = event.platform || detectPlatform(event.meetingLink);
              const isNow = event.start <= new Date() && event.end >= new Date();
              const isSoon = !isNow && event.start.getTime() - Date.now() < 15 * 60 * 1000;

              return (
                <div
                  key={event.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                    isNow ? "bg-red-50/50 border-red-200" : isSoon ? "bg-yellow-50/50 border-yellow-200" : "bg-card border-muted"
                  } transition-colors hover:bg-accent/50`}
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-medium truncate text-sm">{event.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {isNow
                          ? "Now"
                          : formatDistanceToNow(event.start, { addSuffix: true })}
                      </span>
                      {platform && (
                        <>
                          <span>•</span>
                          <Video className="w-3 h-3" />
                          <span>{platform}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className={isNow || isSoon ? "bg-red-500 hover:bg-red-600 shadow-md" : ""}
                    onClick={() => onStartRecording(event.title)}
                  >
                    <Mic className="w-3 h-3 mr-1" />
                    Record
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
