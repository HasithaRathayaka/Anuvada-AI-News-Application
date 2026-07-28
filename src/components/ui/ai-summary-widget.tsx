interface AISummaryWidgetProps {
  bullets: string[];
  date?: string;
}

export default function AISummaryWidget({ bullets, date = "May 31, 2026" }: AISummaryWidgetProps) {
  return (
    <div className="card-surface" style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <h3 className="h3" style={{ color: "#0D0D0F" }}>AI Summary</h3>
        <span style={{ cursor: "pointer", color: "#6B7280" }}>ⓘ</span>
      </div>

      <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "20px" }}>
        Generated {date} • 3 min read
      </div>

      {/* Bullet Points */}
      <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
        {bullets.map((bullet, index) => (
          <li key={index} style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6" }}>
            {bullet}
          </li>
        ))}
      </ul>

      <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "16px" }}>
        AI summaries can make mistakes.
      </div>

      <button className="btn-secondary" style={{ width: "100%", textAlign: "center" }}>
        Provide Feedback
      </button>
    </div>
  );
}
