/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserClient } from '../client'
import { Database } from '../types'

export type TopNewsArticle = Database['public']['Tables']['articles']['Row'] & {
  source: Database['public']['Tables']['sources']['Row'];
  analysis: Database['public']['Tables']['article_analyses']['Row'];
}

// Fallback seed data so the UI functions on day 1
const fallbackArticles: TopNewsArticle[] = [
  {
    id: "1",
    source_id: "s1",
    original_url: "https://example.com/1",
    canonical_url: "https://example.com/1",
    title: "Global Summit Addresses Climate Targets for 2030",
    image_url: "https://picsum.photos/seed/news1/800/600",
    published_date: new Date().toISOString(),
    raw_text: "World leaders met today to discuss the upcoming climate targets and formulate a unified strategy to reduce carbon emissions across all participating nations.",
    scraped_at: new Date().toISOString(),
    analyzed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    source: {
      id: "s1",
      name: "Global News",
      listing_url: "https://example.com",
      parser_strategy: null,
      is_active: true,
      logo_url: null,
      created_at: new Date().toISOString(),
    },
    analysis: {
      id: "a1",
      article_id: "1",
      summary: "Leaders discuss 2030 climate goals.",
      sentiment_score: 0.2,
      sentiment_label: "neutral",
      bias_score: -0.1,
      bias_label: "center",
      left_percentage: 30,
      center_percentage: 45,
      right_percentage: 25,
      confidence: 0.9,
      framing_notes: "Focus on policy and diplomacy without extreme language.",
      loaded_terms: null,
      disclaimer: "AI generated analysis.",
      model: "gpt-4",
      embedding: null,
      created_at: new Date().toISOString(),
    }
  },
  {
    id: "2",
    source_id: "s2",
    original_url: "https://example.com/2",
    canonical_url: "https://example.com/2",
    title: "Markets Rally Following Strong Tech Earnings",
    image_url: "https://picsum.photos/seed/news2/800/600",
    published_date: new Date().toISOString(),
    raw_text: "Technology stocks surged today as major companies reported earnings that vastly exceeded Wall Street expectations, driving overall market indices to record highs.",
    scraped_at: new Date().toISOString(),
    analyzed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    source: {
      id: "s2",
      name: "Business Daily",
      listing_url: "https://example.com",
      parser_strategy: null,
      is_active: true,
      logo_url: null,
      created_at: new Date().toISOString(),
    },
    analysis: {
      id: "a2",
      article_id: "2",
      summary: "Tech earnings drive market rally.",
      sentiment_score: 0.8,
      sentiment_label: "positive",
      bias_score: 0.3,
      bias_label: "right",
      left_percentage: 20,
      center_percentage: 30,
      right_percentage: 50,
      confidence: 0.85,
      framing_notes: "Strong focus on economic growth and corporate success.",
      loaded_terms: null,
      disclaimer: "AI generated analysis.",
      model: "gpt-4",
      embedding: null,
      created_at: new Date().toISOString(),
    }
  }
];

export async function getTopNewsArticles(params?: { q?: string; tab?: string }): Promise<TopNewsArticle[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return fallbackArticles;
  }

  const supabase = createBrowserClient();
  
  let query = supabase
    .from('articles')
    .select(`
      *,
      source:sources(*),
      analysis:article_analyses(*)
    `)
    .not('analyzed_at', 'is', null);

  if (params?.q) {
    query = query.ilike('title', `%${params.q}%`);
  }
  
  const { data, error } = await query
    .order('published_date', { ascending: false })
    .limit(30);
    
  if (error) {
    console.error("Error fetching top news articles:", error);
    return fallbackArticles;
  }
  
  if (!data || (data as any[]).length === 0) {
    return fallbackArticles;
  }
  
  // Format the result properly ensuring relation types are matched
  let formattedData = (data as any[]).map(item => ({
    ...item,
    analysis: Array.isArray(item.analysis) ? item.analysis[0] : item.analysis
  })) as TopNewsArticle[];

  if (params?.tab === "Blindspot") {
    formattedData = formattedData.filter(item => item.analysis?.bias_label === "center" || item.analysis?.confidence < 0.6);
  } else if (params?.tab === "Local") {
    formattedData = formattedData.filter(item => item.title.includes("Local") || item.analysis?.summary?.includes("local"));
  }

  return formattedData.slice(0, 12);
}

export async function getArticleById(id: string): Promise<TopNewsArticle | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return fallbackArticles.find(a => a.id === id) || null;
  }

  const supabase = createBrowserClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      source:sources(*),
      analysis:article_analyses(*)
    `)
    .eq('id', id)
    .single();
    
  if (error || !data) {
    console.error(`Error fetching article ${id}:`, error);
    return null;
  }
  
  const anyData = data as any;
  return {
    ...anyData,
    analysis: Array.isArray(anyData.analysis) ? anyData.analysis[0] : anyData.analysis
  } as TopNewsArticle;
}

export async function getRelatedArticles(id: string): Promise<TopNewsArticle[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return fallbackArticles.filter(a => a.id !== id);
  }

  const supabase = createBrowserClient();
  
  // 1. Fetch the embedding of the current article
  const { data: analysisData } = await supabase
    .from('article_analyses')
    .select('embedding')
    .eq('article_id', id)
    .single() as any;

  let matchedIds: string[] = [];
  
  if (analysisData?.embedding) {
    // 2. Query for related articles using pgvector semantic search
    const { data: matches, error: rpcError } = await (supabase.rpc as any)('match_articles', {
      query_embedding: analysisData.embedding,
      match_threshold: 0.6, // You can adjust this threshold
      match_count: 6,
      p_article_id: id
    });

    if (!rpcError && matches && matches.length > 0) {
      matchedIds = matches.map((m: any) => m.id);
    }
  }
  
  let data: any[] | null = null;
  let error = null;

  if (matchedIds.length > 0) {
    // 3a. Fetch the matched articles
    const response = await supabase
      .from('articles')
      .select(`
        *,
        source:sources(*),
        analysis:article_analyses(*)
      `)
      .in('id', matchedIds);
      
    data = response.data;
    error = response.error;
    
    // Sort to match the order of matchedIds (which is by similarity descending)
    if (data) {
      data.sort((a, b) => matchedIds.indexOf(a.id) - matchedIds.indexOf(b.id));
    }
  } else {
    // 3b. Fallback: fetch recent analyzed articles excluding the current one
    const response = await supabase
      .from('articles')
      .select(`
        *,
        source:sources(*),
        analysis:article_analyses(*)
      `)
      .not('analyzed_at', 'is', null)
      .neq('id', id)
      .order('published_date', { ascending: false })
      .limit(6);
      
    data = response.data;
    error = response.error;
  }
    
  if (error || !data) {
    return [];
  }
  
  return (data as any[]).map(item => ({
    ...item,
    analysis: Array.isArray(item.analysis) ? item.analysis[0] : item.analysis
  })) as TopNewsArticle[];
}
