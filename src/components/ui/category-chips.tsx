"use client";

import { useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const categories = [
  "World Cup +",
  "IPL +",
  "Social Media +",
  "Business & Markets +",
  "Health & Medicine +",
  "Soccer +",
  "Artificial Intelligence +",
  "Arsenal FC +",
  "Extreme Weather and Disasters +",
];

export default function CategoryChips() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const currentQ = searchParams.get("q") || "";

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div style={{ backgroundColor: "#EDEDE9", borderBottom: "1px solid #E2E4DC", padding: "8px 0" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Left Scroll Arrow */}
        <button
          onClick={() => handleScroll("left")}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            color: "#6B7280",
            cursor: "pointer",
            padding: "0 4px",
          }}
          aria-label="Scroll left"
        >
          ‹
        </button>

        {/* Scrollable Chips List */}
        <div
          ref={scrollRef}
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            scrollBehavior: "smooth",
            padding: "2px 0",
            flexGrow: 1,
          }}
        >
          {categories.map((category, index) => {
            const categoryName = category.replace(" +", "");
            const isActive = currentQ === categoryName;
            return (
              <Link 
                key={index} 
                href={isActive ? "/" : `/?q=${encodeURIComponent(categoryName)}`} 
                className={`chip ${isActive ? "active" : ""}`}
                style={{ textDecoration: "none" }}
              >
                {category}
              </Link>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => handleScroll("right")}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            color: "#6B7280",
            cursor: "pointer",
            padding: "0 4px",
          }}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </div>
  );
}
