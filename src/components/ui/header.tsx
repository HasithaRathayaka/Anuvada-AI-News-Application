import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export default function Header({ activeTab = "Home" }: { activeTab?: string }) {
  return (
    <header style={{ backgroundColor: "#EDEDE9", borderBottom: "1px solid #E2E4DC" }}>


      {/* Main Navigation Bar */}
      <div className="container header-container">
        {/* Left: Menu Hamburger + Brand Logo + Nav */}
        <div className="header-left-group">
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              padding: "4px",
            }}
            aria-label="Toggle Menu"
          >
            <span style={{ width: "18px", height: "2px", backgroundColor: "#0D0D0F" }}></span>
            <span style={{ width: "18px", height: "2px", backgroundColor: "#0D0D0F" }}></span>
            <span style={{ width: "18px", height: "2px", backgroundColor: "#0D0D0F" }}></span>
          </button>

          {/* anuvada News Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "1" }}>
              <span className="header-logo-text">
                anuvada
              </span>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", textAlign: "right", marginTop: "-2px" }}>
                News
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="header-nav">
            <Link href="/" style={{ color: activeTab === "Home" ? "#0D0D0F" : "#6B7280", borderBottom: activeTab === "Home" ? "2px solid #0D0D0F" : "none", paddingBottom: "4px" }}>
              Home
            </Link>
            <Link href="/?tab=For You" style={{ color: activeTab === "For You" ? "#0D0D0F" : "#6B7280", borderBottom: activeTab === "For You" ? "2px solid #0D0D0F" : "none", paddingBottom: "4px" }}>
              For You <sup style={{ color: "#B42318" }}>•</sup>
            </Link>
            <Link href="/?tab=Local" style={{ color: activeTab === "Local" ? "#0D0D0F" : "#6B7280", borderBottom: activeTab === "Local" ? "2px solid #0D0D0F" : "none", paddingBottom: "4px" }}>
              Local
            </Link>
            <Link href="/?tab=Blindspot" style={{ color: activeTab === "Blindspot" ? "#0D0D0F" : "#6B7280", borderBottom: activeTab === "Blindspot" ? "2px solid #0D0D0F" : "none", paddingBottom: "4px" }}>
              Blindspot
            </Link>
          </nav>
        </div>

        {/* Right: Actions (Subscribe & Login) */}
        <div className="header-actions">
          <button className="btn-primary">Subscribe</button>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="btn-secondary">Login</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
