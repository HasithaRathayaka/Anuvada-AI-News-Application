import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import BiasMeter from "@/components/ui/bias-meter";
import BiasAnalysisWidget from "@/components/ui/bias-analysis-widget";
import AISummaryWidget from "@/components/ui/ai-summary-widget";
import SourceBreakdownWidget from "@/components/ui/source-breakdown-widget";
import NewsletterBanner from "@/components/ui/newsletter-banner";
import { getArticleById, getRelatedArticles } from "@/lib/supabase/queries/articles";

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  const relatedStories = await getRelatedArticles(id);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main className="container" style={{ flexGrow: 1, paddingTop: "32px" }}>
        {/* Main 2-Column Details Layout */}
        <div className="grid-article-layout">
          {/* Left Main Article Column */}
          <div>
            {/* Category Breadcrumb */}
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "12px" }}>
              {article.source.name} - Global
            </div>

            {/* Headline Title */}
            <h1 className="h1" style={{ color: "#0D0D0F", marginBottom: "16px", lineHeight: "1.2" }}>
              {article.title}
            </h1>

            {/* Byline & Metadata Row */}
            <div
              className="flex-between"
              style={{
                fontSize: "13px",
                color: "#6B7280",
                borderBottom: "1px solid #E5E7EB",
                paddingBottom: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <strong style={{ color: "#0D0D0F" }}>biasly AI</strong> | {new Date(article.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} | 5 min read
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "13px" }}>
                  Save
                </button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "15px" }}>
                  🔖
                </button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "13px" }}>
                  Share ↗
                </button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "15px" }}>
                  •••
                </button>
              </div>
            </div>

            {/* Hero Main Image */}
            <div className="article-hero-img" style={{ position: "relative", width: "100%", height: "420px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#E5E7EB" }}>
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                sizes="(max-width: 1200px) 100vw, 800px"
                style={{ objectFit: "cover" }}
                unoptimized
                priority
              />
            </div>
            {/* Photo Caption */}
            <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "8px", marginBottom: "24px", lineHeight: "1.4" }}>
              {article.source.name}
            </p>

            {/* Bias Distribution Card */}
            <div className="card-surface" style={{ padding: "20px", marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700", color: "#0D0D0F", marginBottom: "12px" }}>
                <span>Bias Distribution</span>
                <span style={{ cursor: "pointer", color: "#6B7280" }}>ⓘ</span>
              </div>

              <BiasMeter leftPct={article.analysis?.left_percentage ?? 0} centerPct={article.analysis?.center_percentage ?? 0} rightPct={article.analysis?.right_percentage ?? 0} size="md" />

              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "12px", fontWeight: "600" }}>
                1 sources
              </div>
            </div>

            {/* Article Prose Body Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontSize: "16px", color: "#1F2937", lineHeight: "1.7", marginBottom: "48px" }}>
              {article.raw_text.split('\n\n').filter(Boolean).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Related Stories Section */}
            {relatedStories.length > 0 && (
              <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "32px" }}>
                <h2 className="h2" style={{ color: "#0D0D0F", marginBottom: "24px" }}>
                  Related Stories
                </h2>

                <div className="grid-related-stories">
                  {relatedStories.map((story) => (
                    <Link key={story.id} href={`/article/${story.id}`} style={{ textDecoration: "none" }}>
                      <div className="card-surface" style={{ display: "flex", gap: "16px", padding: "12px", alignItems: "center" }}>
                        <div style={{ position: "relative", width: "100px", height: "70px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                          <Image src={story.image_url} alt={story.title} fill style={{ objectFit: "cover" }} unoptimized />
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>
                            {story.source.name} • Global
                          </div>
                          <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0D0D0F", lineHeight: "1.3", margin: "4px 0" }}>
                            {story.title}
                          </h4>
                          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                            {new Date(story.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • 5 min read
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <BiasAnalysisWidget
              leftPct={article.analysis?.left_percentage ?? 0}
              centerPct={article.analysis?.center_percentage ?? 0}
              rightPct={article.analysis?.right_percentage ?? 0}
              sourcesCount={1}
            />

            <AISummaryWidget bullets={[article.analysis?.summary ?? ""]} date={new Date(article.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />

            <SourceBreakdownWidget sourcesCount={1} sources={[{ name: article.source.name, biasLabel: "Center" }]} />
          </div>
        </div>

        {/* Newsletter Call-to-Action Banner */}
        <NewsletterBanner />
      </main>

      <Footer />
    </div>
  );
}
