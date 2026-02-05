"use client";
import { useState } from "react";
import "./globals.css";
import Link from "next/link";
import { DM_Serif_Display, Quicksand, Inter } from "next/font/google";
import { Instagram, Facebook, Twitter, Menu, X } from "lucide-react";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { HoverProfile } from "@/components/hover-profile";
import FloatingActionButton from "@/components/floating-action-button";
import { Button } from "@/components/ui/button";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-inter",
});

const quicksand = Quicksand({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-quicksand",
});

const dmserifdisplay = DM_Serif_Display({
  weight: "400",
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-dmserifdisplay",
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(false);
  const { isLogin } = useAuth();

  return (
    <html
      lang="en"
      className={`${dmserifdisplay.variable} ${quicksand.variable} ${inter.variable}`}
    >
      <body className="bg-[#f4f9f4] text-[#ffffff]">
        <div className="relative flex justify-center w-full bg-[#006400]">
          <div className="flex items-center justify-between w-full md:w-[90%] h-16 md:h-24 px-4 md:px-6 py-3">
            <div>
              <Link href="/">
                <h1 className="text-2xl md:text-4xl text-white">WeeklyBite</h1>
              </Link>
            </div>

            <nav className="hidden md:flex md:items-center gap-6 text-white">
              <Link href="/" className="hover:text-[#70e000]">
                Home
              </Link>
              <Link href="/about" className="hover:text-[#70e000]">
                About
              </Link>
              <Link
                href="/plan/results"
                className="hover:text-[#70e000]"
                onClick={() => setMenuOpen(false)}
              >
                My Plans
              </Link>
              <Link
                href="/plan/prep"
                className="hover:text-[#70e000]"
                onClick={() => setMenuOpen(false)}
              >
                Create Plan
              </Link>

              {isLogin ? (
                <>
                  <HoverProfile />
                </>
              ) : (
                <>
                  <div className="flex flex-row justify-center items-center">
                    <div className="bg-[#006400] rounded-full shadow-lg">
                      <Button
                        className="bg-[#006400] hover:bg-[#006400] hover:text-white rounded-full hover:shadow-2xl hover:scale-115 transition-transform duration-200"
                        variant="ghost"
                      >
                        <Link
                          href="/auth/register"
                          onClick={() => setMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </Button>
                      <Button
                        className="rounded-full bg-white text-black hover:bg-[#70e000] hover:text-[#004b23] border-none hover:shadow-2xl hover:scale-115 transition-transform duration-200"
                        variant="outline"
                      >
                        <Link
                          href="/auth/login"
                          onClick={() => setMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </nav>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="md:hidden text-white"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {menuOpen && (
            <div className="absolute top-full left-0 right-0 bg-[#004b23] md:hidden z-50">
              <div className="flex flex-col items-start gap-4 px-4 py-4 text-white">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/about" onClick={() => setMenuOpen(false)}>
                  About
                </Link>
                <Link href="/plan/results" onClick={() => setMenuOpen(false)}>
                  My Plans
                </Link>
                <Link href="/plan/prep" onClick={() => setMenuOpen(false)}>
                  Create Plan
                </Link>
                {isLogin ? (
                  <>
                    <HoverProfile />
                  </>
                ) : (
                  <>
                    <div className="flex flex-row justify-center items-center">
                      <Link
                        href="/auth/login"
                        onClick={() => setMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <main>{children}</main>
        <FloatingActionButton />
        <footer className="flex flex-col justify-center items-center w-full py-8 gap-6 bg-[#004b23] text-white">
          <div className="w-full md:w-[90%] px-4 md:px-6 flex items-center justify-between py-4">
            <h1 className="text-2xl md:text-4xl">WeeklyBite</h1>
            <div className="hidden md:flex gap-6">
              <h4>SUPPORT</h4>
              <h4>CONTACT</h4>
              <h4>ABOUT</h4>
            </div>
          </div>

          <div className="w-full md:w-[90%] px-4 md:px-6 flex flex-col md:flex-row md:justify-between gap-4 items-start md:items-center">
            <div className="flex gap-4 items-center">
              <Instagram />
              <Facebook />
              <Twitter />
            </div>

            <div className="flex flex-col items-start  md:flex-row gap-4 text-sm">
              <div className="flex gap-4 items-center">
                <h4>TERM</h4>
                <h4>PRIVACY</h4>
                <span>|</span>
                <h4>© 2026</h4>
              </div>

              <p className="text-xs pt-0.5">
                DO NOT SELL MY PERSONAL INFORMATION
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
