import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0D0D0F", color: "#ffffff", paddingTop: "48px", paddingBottom: "32px", marginTop: "64px" }}>
      <div className="container">
        {/* Main Footer Links */}
        <div className="grid-footer">
          {/* Brand Column */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "1", marginBottom: "12px" }}>
              <span style={{ fontSize: "28px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.03em" }}>
                anuvada
              </span>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", textAlign: "left" }}>
                News
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#9CA3AF", maxWidth: "260px", lineHeight: "1.5" }}>
              Balanced news coverage, powered by AI.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "600", color: "#ffffff", marginBottom: "14px" }}>Company</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#9CA3AF" }}>
              <li><Link href="#" style={{ color: "inherit" }}>About</Link></li>
              <li><Link href="#" style={{ color: "inherit" }}>Careers</Link></li>
              <li><Link href="#" style={{ color: "inherit" }}>Press</Link></li>
              <li><Link href="#" style={{ color: "inherit" }}>Contact</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "600", color: "#ffffff", marginBottom: "14px" }}>Help</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#9CA3AF" }}>
              <li><Link href="#" style={{ color: "inherit" }}>Help Center</Link></li>
              <li><Link href="#" style={{ color: "inherit" }}>Guides</Link></li>
              <li><Link href="#" style={{ color: "inherit" }}>Privacy Policy</Link></li>
              <li><Link href="#" style={{ color: "inherit" }}>Terms of Service</Link></li>
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "600", color: "#ffffff", marginBottom: "14px" }}>Connect</h4>
            <div style={{ display: "flex", gap: "12px", fontSize: "16px", color: "#9CA3AF" }}>
              <span style={{ cursor: "pointer" }}>𝕏</span>
              <span style={{ cursor: "pointer" }}>in</span>
              <span style={{ cursor: "pointer" }}>📷</span>
              <span style={{ cursor: "pointer" }}>▶</span>
            </div>
          </div>
        </div>

        {/* Copyright Bottom Row */}
        <div className="flex-between" style={{ paddingTop: "24px", fontSize: "12px", color: "#6B7280" }}>
          <span>© 2026 Anuvada News. All rights reserved.</span>
          <span>Stay consistent. Stay unbiased.</span>
        </div>
      </div>
    </footer>
  );
}
