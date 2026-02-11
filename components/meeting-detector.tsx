"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Video, X, Mic } from "lucide-react";

const MEETING_PATTERNS = [
  { pattern: /meet\.google\.com/, name: "Google Meet" },
  { pattern: /zoom\.us\/j\//, name: "Zoom" },
  { pattern: /teams\.microsoft\.com.*\/meeting/, name: "Microsoft Teams" },
  { pattern: /whereby\.com/, name: "Whereby" },
  { pattern: /webex\.com/, name: "Webex" },
  { pattern: /discord\.com.*\/channels/, name: "Discord" },
];

interface MeetingDetectorProps {
  onStartRecording: () => void;
}

export function MeetingDetector({ onStartRecording }: MeetingDetectorProps) {
  const [detectedMeeting, setDetectedMeeting] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const checkForMeeting = useCallback(() => {
    // Check current URL
    const url = window.location.href;
    for (const { pattern, name } of MEETING_PATTERNS) {
      if (pattern.test(url)) {
        setDetectedMeeting(name);
        return;
      }
    }
    setDetectedMeeting(null);
  }, []);

  useEffect(() => {
    // Check on mount
    checkForMeeting();

    // Listen for URL changes (for SPAs)
    const handlePopState = () => checkForMeeting();
    window.addEventListener("popstate", handlePopState);

    // Check periodically (in case user has multiple tabs)
    const interval = setInterval(checkForMeeting, 5000);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      clearInterval(interval);
    };
  }, [checkForMeeting]);

  // Listen for messages from other tabs about detected meetings
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "meeting-detected") {
        setDetectedMeeting(event.data.platform);
        setDismissed(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!detectedMeeting || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white border shadow-lg rounded-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Video className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Meeting Detected!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              It looks like you're in a {detectedMeeting} meeting. Would you like to start recording?
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="bg-red-500 hover:bg-red-600" onClick={onStartRecording}>
                <Mic className="w-4 h-4 mr-1" />
                Start Recording
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDismissed(true)}>
                Dismiss
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
