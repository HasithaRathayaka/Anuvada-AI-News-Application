import { NextResponse } from 'next/server';
import { getPendingArticles, saveArticleAnalysis, logAnalysisRun } from '@/lib/supabase/queries/ai';
import { analyzeArticle } from '@/lib/ai/analyzer';

export async function POST(request: Request) {
  const authHeader = request.headers.get('x-biasly-admin-secret');
  if (authHeader !== process.env.BIASLY_ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const batchSize = 5;
  let totalProcessed = 0;
  let successCount = 0;
  let failCount = 0;

  try {
    const pendingArticles = await getPendingArticles(batchSize);

    if (pendingArticles.length === 0) {
      console.log("No pending articles found for analysis.");
      return NextResponse.json({ message: 'No pending articles found.' });
    }

    console.log(`Found ${pendingArticles.length} pending articles. Starting analysis...`);

    for (const article of pendingArticles) {
      console.log(`Analyzing article ${article.id}: "${article.title}"`);
      const analysis = await analyzeArticle(article);

      if (analysis) {
        const saved = await saveArticleAnalysis(article.id, analysis);
        if (saved) {
          console.log(`Successfully saved analysis for article ${article.id}`);
          successCount++;
        } else {
          console.error(`Failed to save analysis for article ${article.id}`);
          failCount++;
        }
      } else {
        console.error(`AI generation failed for article ${article.id}`);
        failCount++;
      }
      totalProcessed++;
    }

    const summary = {
      status: 'completed',
      total_processed: totalProcessed,
      success_count: successCount,
      fail_count: failCount,
    };

    console.log("Analysis batch completed:", summary);
    await logAnalysisRun("AI Analysis batch completed", summary);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("AI Analysis route error:", error);
    await logAnalysisRun("AI Analysis failed", { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
