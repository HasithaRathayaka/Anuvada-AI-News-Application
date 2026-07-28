/* eslint-disable @typescript-eslint/no-explicit-any */
import { scrapeLiveUrl } from '../oxylabs/client';
import { extractCandidateLinks, parseArticleDetail } from './parser';
import { getActiveSources, getExistingUrls, insertArticles } from '../supabase/queries/scraping';
import { Database } from '../supabase/types';

type ArticleInsert = Database['public']['Tables']['articles']['Insert'];

export interface ScrapeSummary {
  status: string;
  sourcesChecked: number;
  candidatesFound: number;
  candidatesRejected: number;
  duplicatesSkipped: number;
  detailPagesScraped: number;
  articlesInserted: number;
  articlesRejected: number;
  articlesFailed: number;
  totalDuration: number;
  rejectionReasons: Record<string, number>;
}

export async function processSourceHomepage(source: any, html: string, summary: ScrapeSummary): Promise<void> {
  console.log(`[Pipeline] Processing source: ${source.name} (${source.listing_url})`);
  
  // 1. Extract candidates
  const candidates = extractCandidateLinks(html, source.listing_url);
  console.log(`[Pipeline] Found ${candidates.length} candidates on ${source.name}`);
  summary.candidatesFound += candidates.length;
  
  if (candidates.length === 0) return;
  
  // 2. Deduplicate
  const existing = await getExistingUrls(candidates);
  const newUrls = candidates.filter(u => !existing.has(u));
  summary.duplicatesSkipped += (candidates.length - newUrls.length);
  console.log(`[Pipeline] Deduplicated: ${newUrls.length} new URLs to scrape`);
  
  // 3. Detail Scrape & Parse
  const validArticles: ArticleInsert[] = [];
  
  // Limit to 5 per source for safety
  const toProcess = newUrls.slice(0, 5);
  
  for (const url of toProcess) {
    summary.detailPagesScraped++;
    try {
      console.log(`[Pipeline] Scraping detail: ${url}`);
      const detailHtml = await scrapeLiveUrl(url);
      const parsed = parseArticleDetail(detailHtml, url);
      
      if (parsed) {
        validArticles.push({
          source_id: source.id,
          original_url: url,
          canonical_url: parsed.canonicalUrl,
          title: parsed.title,
          image_url: parsed.imageUrl,
          published_date: parsed.publishedDate,
          raw_text: parsed.rawText,
          scraped_at: new Date().toISOString()
        });
        summary.articlesInserted++;
        console.log(`[Pipeline] Accepted article: ${parsed.title}`);
      } else {
         summary.articlesRejected++;
         summary.rejectionReasons['Failed Validation Gate'] = (summary.rejectionReasons['Failed Validation Gate'] || 0) + 1;
         console.log(`[Pipeline] Rejected URL (failed validation): ${url}`);
      }
    } catch (e: any) {
      summary.articlesFailed++;
      summary.rejectionReasons['Scrape Error'] = (summary.rejectionReasons['Scrape Error'] || 0) + 1;
      console.error(`[Pipeline] Error scraping ${url}:`, e.message);
    }
  }
  
  // 4. Insert
  if (validArticles.length > 0) {
    await insertArticles(validArticles);
    console.log(`[Pipeline] Inserted ${validArticles.length} articles for ${source.name}`);
  }
}

export async function runManualScrape(): Promise<ScrapeSummary> {
  const startTime = Date.now();
  const summary: ScrapeSummary = {
    status: 'completed',
    sourcesChecked: 0,
    candidatesFound: 0,
    candidatesRejected: 0,
    duplicatesSkipped: 0,
    detailPagesScraped: 0,
    articlesInserted: 0,
    articlesRejected: 0,
    articlesFailed: 0,
    totalDuration: 0,
    rejectionReasons: {}
  };

  const sources = await getActiveSources();
  summary.sourcesChecked = sources.length;
  console.log(`[Pipeline] Manual scrape started for ${sources.length} sources`);
  
  for (const source of sources) {
    try {
      const html = await scrapeLiveUrl(source.listing_url);
      await processSourceHomepage(source, html, summary);
    } catch (e: any) {
      console.error(`[Pipeline] Failed to fetch homepage for ${source.name}:`, e.message);
    }
  }
  
  summary.totalDuration = Date.now() - startTime;
  console.log(`[Pipeline] Manual scrape completed in ${summary.totalDuration}ms`, summary);
  return summary;
}
