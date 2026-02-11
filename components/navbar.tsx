"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Mic, LayoutDashboard, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const openMiniRecorder = () => {
    const width = 320;
    const height = 400;
    const left = window.screen.width - width - 20;
    const top = 100;
    
    window.open(
      "/recorder",
      "MeetingIntel Recorder",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`
    );
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-5xl rounded-2xl border-2 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-90">
              <div className="w-9 h-9 bg-red-600 rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-center border-2 border-red-500">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">MeetingIntel</span>
            </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant={isActive("/dashboard") ? "secondary" : "ghost"}
              asChild
              size="sm"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant={isActive("/settings") ? "secondary" : "ghost"}
              asChild
              size="sm"
            >
              <Link href="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-red-500 hover:bg-red-600">
                  <Mic className="w-4 h-4 mr-2" />
                  New Meeting
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/meeting/new">
                    <Mic className="w-4 h-4 mr-2" />
                    Full Page Recorder
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openMiniRecorder}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Mini Recorder (Popup)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  </div>
  );
}
