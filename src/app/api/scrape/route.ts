/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { runManualScrape } from '@/lib/scraping/pipeline';

export async function POST(request: Request) {
  const authHeader = request.headers.get('x-biasly-admin-secret');
  if (authHeader !== process.env.BIASLY_ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await runManualScrape();
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, status: 'failed' }, { status: 500 });
  }
}
