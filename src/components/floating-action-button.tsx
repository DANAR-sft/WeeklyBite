"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function FloatingActionButton() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // refs untuk detect klik di luar
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        btnRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <>
      <div className="fixed flex items-end gap-2 bottom-6 right-6 sm:bottom-8 sm:right-8 z-10">
        {isOpen && (
          <div
            ref={menuRef}
            className="gap-1 mt-3 mr-0 w-40 bg-transparent text-sm flex flex-col py-2"
          >
            <button
              className="w-full text-left px-3 py-2 bg-[#004b23] hover:bg-[#70e000] hover:scale-110 transition-transform duration-200 rounded-full shadow-lg"
              onClick={() => {
                setIsOpen(false);
                router.push("/plan/prep");
              }}
            >
              Create Plan
            </button>

            <button
              className="w-full text-left px-3 py-2 bg-[#004b23] hover:bg-[#70e000] hover:scale-110 transition-transform duration-200 rounded-full shadow-lg"
              onClick={() => {
                setIsOpen(false);
                router.push("/plan/results");
              }}
            >
              My Plans
            </button>
          </div>
        )}

        <button
          ref={btnRef}
          onClick={() => setIsOpen((s) => !s)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#007200] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
            isHovered ? "scale-110 bg-[#70e000] text-[#004b23]" : "scale-100"
          }`}
          title="Open menu"
        >
          <span className="text-xl sm:text-2xl w-5">+</span>
          <span className="sr-only">Open quick actions</span>
        </button>
      </div>
    </>
  );
}
