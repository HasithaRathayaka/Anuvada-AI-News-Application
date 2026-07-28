import Image from "next/image";
import Link from "next/link";
import BiasMeter from "./bias-meter";

import { TopNewsArticle } from "@/lib/supabase/queries/articles";

interface NewsCardProps {
  article: TopNewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <article className="card-surface" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Thumbnail Image Container */}
      <div style={{ position: "relative", width: "100%", height: "190px", backgroundColor: "#E5E7EB" }}>
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
          style={{ objectFit: "cover" }}
          unoptimized
        />
        {/* Info Icon Badge */}
        <button
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.5)",
            color: "#ffffff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "12px",
          }}
          aria-label="Article bias details"
        >
          ⓘ
        </button>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
        <div>
          {/* Category & Location */}
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: "500", marginBottom: "6px" }}>
            {article.source.name} • Global
          </div>

          {/* Headline */}
          <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#0D0D0F", lineHeight: "1.3", marginBottom: "16px" }}>
            <Link href={`/article/${article.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              {article.title}
            </Link>
          </h3>
        </div>

        {/* Bias Meter & Sources Count Footer */}
        <div>
          <BiasMeter leftPct={article.analysis?.left_percentage ?? 0} centerPct={article.analysis?.center_percentage ?? 0} rightPct={article.analysis?.right_percentage ?? 0} />

          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "10px", fontWeight: "500" }}>
            1 sources
          </div>
        </div>
      </div>
    </article>
  );
}
