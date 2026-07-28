/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getActiveSources, getOxylabsSchedules, insertOxylabsSchedule, deleteOrphanSchedules } from '@/lib/supabase/queries/scraping';
import { listSchedules, createSchedule, updateScheduleState } from '@/lib/oxylabs/client';

export async function GET() {
  try {
    const dbSchedules = await getOxylabsSchedules();
    return NextResponse.json(dbSchedules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('x-biasly-admin-secret');
  if (authHeader !== process.env.BIASLY_ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sources = await getActiveSources();
    const validScheduleIds: string[] = [];

    // 1. Create schedules for active sources
    for (const source of sources) {
      // Create hourly schedule
      const sched = await createSchedule(source.listing_url, "0 * * * *");
      validScheduleIds.push(sched.id);
      
      // Save to Supabase
      await insertOxylabsSchedule(sched.id, source.id);
    }

    // 2. Fetch all Oxylabs schedules and deactivate orphans
    const allOxySchedules = await listSchedules();
    let deactivated = 0;
    
    for (const s of allOxySchedules) {
      if (!validScheduleIds.includes(s.id) && s.state === 'active') {
        await updateScheduleState(s.id, 'suspended');
        deactivated++;
      }
    }

    // 3. Clean up orphans in Supabase
    await deleteOrphanSchedules(validScheduleIds);

    return NextResponse.json({ 
      success: true, 
      created: validScheduleIds.length,
      deactivated
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
