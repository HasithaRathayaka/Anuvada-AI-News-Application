interface BiasMeterProps {
  leftPct: number;
  centerPct: number;
  rightPct: number;
  size?: "sm" | "md" | "lg";
}

export default function BiasMeter({ leftPct, centerPct, rightPct, size = "sm" }: BiasMeterProps) {
  const height = size === "sm" ? "22px" : size === "md" ? "26px" : "32px";
  const fontSize = size === "sm" ? "11px" : "12px";

  return (
    <div
      style={{
        display: "flex",
        height: height,
        width: "100%",
        borderRadius: "4px",
        overflow: "hidden",
        backgroundColor: "#E5E7EB",
        fontSize: fontSize,
        fontWeight: "700",
        lineHeight: height,
        textAlign: "center",
      }}
    >
      {/* Left Segment (Red) */}
      <div
        style={{
          width: `${leftPct}%`,
          backgroundColor: "#B42318",
          color: "#ffffff",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          transition: "width 0.3s ease",
          padding: "0 4px",
        }}
        title={`Left: ${leftPct}%`}
      >
        {leftPct >= 8 ? `L ${leftPct}%` : ""}
      </div>

      {/* Center Segment (Light Gray) */}
      <div
        style={{
          width: `${centerPct}%`,
          backgroundColor: "#E5E7EB",
          color: "#374151",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          transition: "width 0.3s ease",
          padding: "0 4px",
        }}
        title={`Center: ${centerPct}%`}
      >
        {centerPct >= 12 ? `Center ${centerPct}%` : ""}
      </div>

      {/* Right Segment (Blue) */}
      <div
        style={{
          width: `${rightPct}%`,
          backgroundColor: "#1D4ED8",
          color: "#ffffff",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          transition: "width 0.3s ease",
          padding: "0 4px",
        }}
        title={`Right: ${rightPct}%`}
      >
        {rightPct >= 8 ? `Right ${rightPct}%` : ""}
      </div>
    </div>
  );
}
