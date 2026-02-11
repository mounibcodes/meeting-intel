"use client";

import { useRouter } from "next/navigation";
import { UpcomingMeetings } from "@/components/upcoming-meetings";

export function UpcomingMeetingsWrapper() {
  const router = useRouter();

  const handleStartRecording = (title: string) => {
    // Open mini recorder with meeting title
    const width = 320;
    const height = 400;
    const left = window.screen.width - width - 20;
    const top = 100;
    
    const popup = window.open(
      `/recorder?title=${encodeURIComponent(title)}`,
      "MeetingIntel Recorder",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes`
    );

    if (!popup) {
      // Fallback to full page if popup blocked
      router.push(`/meeting/new?title=${encodeURIComponent(title)}`);
    }
  };

  return <UpcomingMeetings onStartRecording={handleStartRecording} />;
}
