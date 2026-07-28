/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '../client';
import { Database } from '../types';

type Source = Database['public']['Tables']['sources']['Row'];
type ArticleInsert = Database['public']['Tables']['articles']['Insert'];

export async function getActiveSources(): Promise<Source[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('sources').select('*').eq('is_active', true);
  
  if (error) {
    console.error("Error fetching active sources:", error);
    return [];
  }
  return data as any as Source[];
}

export async function getExistingUrls(urls: string[]): Promise<Set<string>> {
  const supabase = createAdminClient();
  const existingUrls = new Set<string>();
  
  if (urls.length === 0) return existingUrls;
  
  // Process in chunks of 15 to avoid long .in() queries
  const chunkSize = 15;
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from('articles')
      .select('original_url')
      .in('original_url', chunk);
      
    if (error) {
      console.error("Error checking existing URLs:", error);
      continue;
    }
    
    if (data) {
      for (const row of (data as any[])) {
        existingUrls.add(row.original_url);
      }
    }
  }
  
  return existingUrls;
}

export async function insertArticles(articles: ArticleInsert[]) {
  if (articles.length === 0) return;
  
  const supabase = createAdminClient();
  const { error } = await supabase.from('articles').insert(articles as any);
  
  if (error) {
    console.error("Error inserting articles:", error);
  }
}

export async function getOxylabsSchedules() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('oxylabs_schedules').select('*');
  return (data as any[]) || [];
}

export async function insertOxylabsSchedule(oxylabsScheduleId: string, sourceId: string) {
  const supabase = createAdminClient();
  
  const { data } = await supabase.from('oxylabs_schedules').select('id').eq('oxylabs_schedule_id', oxylabsScheduleId).single();
  if (data) {
    // @ts-expect-error Supabase types infer never here for mutations
    await supabase.from('oxylabs_schedules').update({ source_id: sourceId }).eq('id', String((data as any).id));
  } else {
    // @ts-expect-error Supabase types infer never here for mutations
    await supabase.from('oxylabs_schedules').insert({ oxylabs_schedule_id: oxylabsScheduleId, source_id: sourceId });
  }
}

export async function deleteOrphanSchedules(validScheduleIds: string[]) {
  const supabase = createAdminClient();
  const { data } = await supabase.from('oxylabs_schedules').select('*');
  
  if (data) {
    for (const row of (data as any[])) {
      if (!validScheduleIds.includes(row.oxylabs_schedule_id)) {
        await supabase.from('oxylabs_schedules').delete().eq('id', row.id);
      }
    }
  }
}

export async function getUnprocessedRun(scheduleId: string, runId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase.from('oxylabs_schedule_runs')
    .select('id')
    .eq('schedule_id', scheduleId)
    .eq('run_id', runId)
    .single();
  return !data;
}

export async function markRunProcessed(scheduleId: string, runId: string, status: string, html?: string) {
  const supabase = createAdminClient();
  await supabase.from('oxylabs_schedule_runs').insert({
    schedule_id: scheduleId,
    run_id: runId,
    status: status,
    result_html: html || null
  } as any);
}
