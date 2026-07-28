import Header from "@/components/ui/header";
import CategoryChips from "@/components/ui/category-chips";
import NewsCard from "@/components/ui/news-card";
import Footer from "@/components/ui/footer";
import { getTopNewsArticles, TopNewsArticle } from "@/lib/supabase/queries/articles";
import { Suspense } from "react";

export default async function Home(props: { searchParams?: Promise<{ q?: string; tab?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q;
  const tab = searchParams?.tab || "Home";
  
  const articles = await getTopNewsArticles(searchParams);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header activeTab={tab} />
      <Suspense fallback={<div style={{ height: "40px", backgroundColor: "#EDEDE9" }} />}>
        <CategoryChips />
      </Suspense>

      <main className="container" style={{ flexGrow: 1, paddingTop: "32px" }}>
        {/* Section Heading */}
        <h1 className="h1" style={{ marginBottom: "24px", color: "#0D0D0F" }}>
          {q ? `News about "${q}"` : tab !== "Home" ? `${tab} News` : "Top News"}
        </h1>

        {/* 3-Column Top News Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 350px), 1fr))",
            gap: "24px",
          }}
        >
          {articles.map((article: TopNewsArticle) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
