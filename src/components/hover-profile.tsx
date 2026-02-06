"use client";
import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";
import { logout } from "../../actions/auth-action";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";

export function HoverProfile() {
  const { setIsLogin, isUser, setIsUser } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      const res = await logout();
      if (res?.ok) {
        setIsLogin(false);
        setIsUser("");
        router.push("/auth/login");
        router.refresh(); // Force refresh to update UI
      } else {
        console.error("Logout failed", res?.error);
      }
    } catch (err) {
      console.error("Logout error", err);
    }
  }

  const ProfileContent = () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center text-white text-sm font-semibold">
          {isUser ? isUser.charAt(0).toUpperCase() : "JD"}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {isUser.split("@")[0] || "Anomaly"}
          </span>
          <span className="text-xs opacity-80">
            {isUser || "anomaly@example.com"}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <button
          onClick={() => {
            handleLogout();
            setMobileMenuOpen(false);
          }}
          className="block w-full text-center px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition text-sm"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  // Desktop version with HoverCard
  return (
    <>
      {/* Desktop Menu - Hidden on mobile */}
      <div className="hidden md:block">
        <HoverCard openDelay={10} closeDelay={20}>
          <HoverCardTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 transition">
              <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center text-white text-xs font-semibold">
                {isUser ? isUser.charAt(0).toUpperCase() : "JD"}
              </div>
              <span className="text-sm font-medium text-slate-100">
                {isUser.split("@")[0] || "Anomaly"}
              </span>
            </button>
          </HoverCardTrigger>

          <HoverCardContent className="w-64 p-4 bg-[#004b23] border-none text-white rounded-lg shadow-lg">
            <ProfileContent />
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-1 md:px-3 md:py-2 rounded-md hover:bg-white/5 transition"
        >
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {isUser.split("@")[0] || "Anomaly"}
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="fixed bottom-0 left-0 right-0 bg-[#004b23] text-white rounded-t-lg shadow-lg p-4 z-50">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center text-white text-xs font-semibold">
                    {isUser ? isUser.charAt(0).toUpperCase() : "JD"}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                      {isUser.split("@")[0] || "Anomaly"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-md transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition text-sm font-medium text-center"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
