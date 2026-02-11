"use client";

import { useState } from "react";
import { Copy, Mail, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailDraftProps {
  meetingId: string;
  initialEmail: string | null;
  hasSummary: boolean;
}

export function EmailDraft({ meetingId, initialEmail, hasSummary }: EmailDraftProps) {
  const [email, setEmail] = useState(initialEmail || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateEmail = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, tone: "professional" }),
      });

      if (res.ok) {
        const data = await res.json();
        setEmail(data.email);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to generate email");
      }
    } catch (error) {
      console.error("Failed to generate email:", error);
      alert("Failed to generate email");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInGmail = () => {
    const subject = encodeURIComponent("Meeting Follow-up");
    const body = encodeURIComponent(email);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Follow-up Email Draft</h2>
        {email && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button size="sm" onClick={openInGmail}>
              <Mail className="w-4 h-4 mr-1" />
              Open in Gmail
            </Button>
          </div>
        )}
      </div>

      {email ? (
        <div className="space-y-4">
          <div className="bg-gray-50 border rounded-lg p-4">
            <textarea
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[300px] bg-transparent resize-none focus:outline-none text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateEmail}
            disabled={isGenerating || !hasSummary}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1" />
            )}
            Regenerate
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {hasSummary
              ? "No email generated yet."
              : "Complete the meeting analysis first to generate a follow-up email."}
          </p>
          <Button
            onClick={generateEmail}
            disabled={isGenerating || !hasSummary}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Follow-up Email"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
