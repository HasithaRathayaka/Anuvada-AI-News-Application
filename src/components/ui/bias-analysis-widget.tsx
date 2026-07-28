interface BiasAnalysisWidgetProps {
  leftPct: number;
  centerPct: number;
  rightPct: number;
  sourcesCount: number;
}

export default function BiasAnalysisWidget({
  leftPct,
  centerPct,
  rightPct,
  sourcesCount,
}: BiasAnalysisWidgetProps) {
  return (
    <div className="card-surface" style={{ padding: "24px" }}>
      {/* Header with info icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 className="h3" style={{ color: "#0D0D0F" }}>Bias Analysis</h3>
        <span style={{ cursor: "pointer", color: "#6B7280" }}>ⓘ</span>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: "500", textTransform: "uppercase" }}>
          Overall Bias
        </div>
        <div style={{ fontSize: "24px", fontWeight: "700", color: "#1D4ED8", marginTop: "2px" }}>
          Right {rightPct}%
        </div>
        <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
          Based on {sourcesCount} balanced sources
        </div>
      </div>

      {/* Individual Progress Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {/* Left */}
        <div style={{ display: "grid", gridTemplateColumns: "60px 45px 1fr", alignItems: "center", fontSize: "13px" }}>
          <span style={{ color: "#374151" }}>Left</span>
          <span style={{ fontWeight: "600", color: "#B42318" }}>{leftPct}%</span>
          <div style={{ height: "10px", backgroundColor: "#E5E7EB", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${leftPct}%`, backgroundColor: "#B42318", height: "100%" }} />
          </div>
        </div>

        {/* Center */}
        <div style={{ display: "grid", gridTemplateColumns: "60px 45px 1fr", alignItems: "center", fontSize: "13px" }}>
          <span style={{ color: "#374151" }}>Center</span>
          <span style={{ fontWeight: "600", color: "#374151" }}>{centerPct}%</span>
          <div style={{ height: "10px", backgroundColor: "#E5E7EB", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${centerPct}%`, backgroundColor: "#9CA3AF", height: "100%" }} />
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "grid", gridTemplateColumns: "60px 45px 1fr", alignItems: "center", fontSize: "13px" }}>
          <span style={{ color: "#374151" }}>Right</span>
          <span style={{ fontWeight: "600", color: "#1D4ED8" }}>{rightPct}%</span>
          <div style={{ height: "10px", backgroundColor: "#E5E7EB", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${rightPct}%`, backgroundColor: "#1D4ED8", height: "100%" }} />
          </div>
        </div>
      </div>

      <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5", marginBottom: "20px" }}>
        Our analysis is based on the political leaning of the publication and how the story is framed. Sources are weighted by reliability and recency.
      </p>

      <button className="btn-secondary" style={{ width: "100%", textAlign: "center" }}>
        How We Analyze Bias
      </button>
    </div>
  );
}
