import { createAdminClient } from '../client';
import { Database } from '../types';

export type Article = Database['public']['Tables']['articles']['Row'];
export type InsertAnalysis = Database['public']['Tables']['article_analyses']['Insert'];

export async function getPendingArticles(limit: number = 5): Promise<Article[]> {
  const supabase = createAdminClient() as any;
  
  // Fetch a chunk of recent articles to check for missing analyses
  const { data, error } = await supabase
    .from('articles')
    .select('*, article_analyses(id)')
    .order('created_at', { ascending: false })
    .limit(200); // chunk size
    
  if (error || !data) {
    console.error("Error fetching articles for pending check:", error);
    return [];
  }
  
  const anyData = data as any[];
  const pending = anyData.filter(a => {
    const analyses = Array.isArray(a.article_analyses) ? a.article_analyses : (a.article_analyses ? [a.article_analyses] : []);
    return analyses.length === 0;
  });
  
  // Map back to pure Article type by removing article_analyses
  return pending.slice(0, limit).map(a => {
    const { article_analyses, ...rest } = a;
    return rest as Article;
  });
}

export async function saveArticleAnalysis(articleId: string, analysis: InsertAnalysis): Promise<boolean> {
  const supabase = createAdminClient() as any;
  
  const { error: insertError } = await supabase
    .from('article_analyses')
    .insert(analysis);
    
  if (insertError) {
    console.error(`Error inserting analysis for article ${articleId}:`, insertError);
    return false;
  }
  
  const { error: updateError } = await supabase
    .from('articles')
    .update({ analyzed_at: new Date().toISOString() })
    .eq('id', articleId);
    
  if (updateError) {
    console.error(`Error updating analyzed_at for article ${articleId}:`, updateError);
    return false; 
  }
  
  return true;
}

export async function logAnalysisRun(message: string, details?: any) {
  const supabase = createAdminClient() as any;
  await supabase.from('logs').insert({
    type: 'ai_analysis',
    message,
    details: details || null
  });
}
