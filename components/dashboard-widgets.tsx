"use client";

import { useRouter } from "next/navigation";
import { MeetingReminder } from "@/components/meeting-reminder";
import { FloatingRecordButton } from "@/components/floating-record-button";

export function DashboardWidgets() {
  const router = useRouter();

  const handleStartRecording = (title: string) => {
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
      router.push(`/meeting/new?title=${encodeURIComponent(title)}`);
    }
  };

  return (
    <>
      <MeetingReminder onStartRecording={handleStartRecording} />
      <FloatingRecordButton />
    </>
  );
}
