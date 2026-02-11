"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingRecordButton() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const openMiniRecorder = () => {
    const width = 320;
    const height = 400;
    const left = window.screen.width - width - 20;
    const top = 100;
    
    const popup = window.open(
      "/recorder",
      "MeetingIntel Recorder",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes`
    );

    if (!popup) {
      router.push("/meeting/new");
    }
    setIsExpanded(false);
  };

  const openFullRecorder = () => {
    router.push("/meeting/new");
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {isExpanded ? (
        <div className="flex flex-col gap-2 items-end animate-in slide-in-from-bottom-2">
          <Button
            variant="outline"
            className="shadow-lg bg-white"
            onClick={openFullRecorder}
          >
            Full Page Recorder
          </Button>
          <Button
            variant="outline"
            className="shadow-lg bg-white"
            onClick={openMiniRecorder}
          >
            Mini Popup Recorder
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full shadow-lg bg-white"
            onClick={() => setIsExpanded(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl bg-red-500 hover:bg-red-600"
          onClick={() => setIsExpanded(true)}
        >
          <Mic className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
