/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getOxylabsSchedules, getActiveSources, getUnprocessedRun, markRunProcessed } from '@/lib/supabase/queries/scraping';
import { getScheduleRuns, getJobResult } from '@/lib/oxylabs/client';
import { processSourceHomepage, ScrapeSummary } from '@/lib/scraping/pipeline';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In local dev, skip CRON_SECRET check, otherwise enforce it
    if (process.env.NODE_ENV === 'production' || process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

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

  try {
    const schedules = await getOxylabsSchedules();
    const sources = await getActiveSources();
    summary.sourcesChecked = sources.length;
    
    for (const sched of schedules) {
      const source = sources.find(s => s.id === sched.source_id);
      if (!source) continue;
      
      const runs = await getScheduleRuns(sched.oxylabs_schedule_id);
      
      for (const run of runs) {
        if (run.result_status === 'done') {
          const isUnprocessed = await getUnprocessedRun(sched.id, run.id);
          
          if (isUnprocessed) {
            console.log(`[Cron] Processing run ${run.id} for schedule ${sched.oxylabs_schedule_id}`);
            try {
              const html = await getJobResult(run.id);
              await processSourceHomepage(source, html, summary);
              await markRunProcessed(sched.id, run.id, 'done');
            } catch (e: any) {
               console.error(`[Cron] Error processing run ${run.id}:`, e.message);
               await markRunProcessed(sched.id, run.id, 'failed');
            }
          }
        }
      }
    }
    
    // Step two: trigger AI analysis. 
    console.log("[Cron] Proceeding to AI analysis");
    try {
      // In a real deployed app, we would use an absolute URL from env, e.g. process.env.NEXT_PUBLIC_APP_URL
      // For Next.js App Router, we can also just fetch relatively if it's supported, but absolute is safer.
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const analyzeRes = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'x-biasly-admin-secret': process.env.BIASLY_ADMIN_SECRET || ''
        }
      });
      
      if (!analyzeRes.ok) {
        console.error("[Cron] AI analysis step failed with status:", analyzeRes.status);
      } else {
        const analyzeData = await analyzeRes.json();
        console.log("[Cron] AI analysis step completed:", analyzeData);
      }
    } catch (e: any) {
      console.error("[Cron] Error triggering AI analysis:", e.message);
    }
    
    summary.totalDuration = Date.now() - startTime;
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
