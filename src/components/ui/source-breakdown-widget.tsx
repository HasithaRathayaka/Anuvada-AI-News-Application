interface SourceItem {
  name: string;
  biasLabel: "Left" | "Center" | "Right";
}

interface SourceBreakdownWidgetProps {
  sourcesCount: number;
  sources: SourceItem[];
}

export default function SourceBreakdownWidget({ sourcesCount, sources }: SourceBreakdownWidgetProps) {
  return (
    <div className="card-surface" style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <h3 className="h3" style={{ color: "#0D0D0F" }}>Source Breakdown</h3>
        <span style={{ cursor: "pointer", color: "#6B7280" }}>ⓘ</span>
      </div>

      <div style={{ fontSize: "13px", fontWeight: "600", color: "#0D0D0F", marginBottom: "20px" }}>
        {sourcesCount} Total Sources
      </div>

      {/* Sources Counts */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 70px 1fr", alignItems: "center", fontSize: "13px" }}>
          <span style={{ color: "#374151" }}>Left</span>
          <span style={{ color: "#6B7280" }}>2 (20%)</span>
          <div style={{ height: "8px", backgroundColor: "#E5E7EB", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: "20%", backgroundColor: "#B42318", height: "100%" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "60px 70px 1fr", alignItems: "center", fontSize: "13px" }}>
          <span style={{ color: "#374151" }}>Center</span>
          <span style={{ color: "#6B7280" }}>4 (31%)</span>
          <div style={{ height: "8px", backgroundColor: "#E5E7EB", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: "31%", backgroundColor: "#9CA3AF", height: "100%" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "60px 70px 1fr", alignItems: "center", fontSize: "13px" }}>
          <span style={{ color: "#374151" }}>Right</span>
          <span style={{ color: "#6B7280" }}>6 (49%)</span>
          <div style={{ height: "8px", backgroundColor: "#E5E7EB", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: "49%", backgroundColor: "#1D4ED8", height: "100%" }} />
          </div>
        </div>
      </div>

      {/* Top Sources Table */}
      <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "16px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", marginBottom: "12px" }}>
          <span>Top Sources</span>
          <span>Bias</span>
        </div>

        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {sources.map((src, index) => {
            const color = src.biasLabel === "Left" ? "#B42318" : src.biasLabel === "Right" ? "#1D4ED8" : "#6B7280";
            return (
              <li key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                <span style={{ color: "#0D0D0F", fontWeight: "500" }}>{src.name}</span>
                <span style={{ color: color, fontWeight: "600" }}>{src.biasLabel}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <button className="btn-secondary" style={{ width: "100%", textAlign: "center" }}>
        View All Sources
      </button>
    </div>
  );
}
