/* eslint-disable @typescript-eslint/no-explicit-any */
export interface OxylabsScrapeResult {
  content: string;
}

export interface OxylabsSchedule {
  id: string; // stored as string due to 64-bit precision
  state: 'active' | 'suspended';
  cron: string;
  query: any;
}

export interface OxylabsJobRun {
  id: string;
  result_status: 'done' | 'pending' | 'faulted' | 'not_found';
}

const OXYLABS_DATA_API_BASE = 'https://data.oxylabs.io/v1';
const OXYLABS_REALTIME_API = 'https://realtime.oxylabs.io/v1/queries';

function getAuthHeader() {
  const user = process.env.OXYLABS_USERNAME;
  const pass = process.env.OXYLABS_PASSWORD;
  if (!user || !pass) {
    throw new Error("Missing Oxylabs credentials");
  }
  return 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
}

/**
 * Parses large JSON with bigints into strings for specific fields.
 * Extremely critical for schedule_id and job_id from Oxylabs.
 */
function parseBigIntsJSON(jsonStr: string) {
  // We use regex to wrap large unquoted numbers in quotes if they are attached to "id" or "schedule_id"
  // For example: "id": 1234567890123456789 -> "id": "1234567890123456789"
  const replaced = jsonStr.replace(/"(id|schedule_id|job_id)"\s*:\s*([0-9]{15,})/g, '"$1": "$2"');
  return JSON.parse(replaced);
}

export async function scrapeLiveUrl(url: string): Promise<string> {
  const body = {
    source: 'universal',
    url: url,
    render: 'html',
  };

  const response = await fetch(OXYLABS_REALTIME_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Oxylabs Real-Time API error: ${response.status} ${err}`);
  }

  const rawText = await response.text();
  const data = parseBigIntsJSON(rawText);
  
  if (data.results && data.results.length > 0) {
    return data.results[0].content;
  }
  
  throw new Error("No content in Oxylabs response");
}

export async function listSchedules(): Promise<OxylabsSchedule[]> {
  const response = await fetch(`${OXYLABS_DATA_API_BASE}/schedules`, {
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list schedules: ${response.status}`);
  }

  const rawText = await response.text();
  const data = parseBigIntsJSON(rawText);
  return data.schedules || [];
}

export async function createSchedule(url: string, cron: string): Promise<OxylabsSchedule> {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 10);

  const body = {
    cron: cron,
    items: [
      {
        source: 'universal',
        url: url,
        render: 'html',
      }
    ],
    end_time: futureDate.toISOString().replace(/\.\d{3}Z$/, 'Z')
  };

  const response = await fetch(`${OXYLABS_DATA_API_BASE}/schedules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create schedule: ${response.status} ${text}`);
  }

  const rawText = await response.text();
  return parseBigIntsJSON(rawText);
}

export async function updateScheduleState(scheduleId: string, state: 'active' | 'suspended') {
  const response = await fetch(`${OXYLABS_DATA_API_BASE}/schedules/${scheduleId}/state`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({ state }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update schedule state: ${response.status}`);
  }
}

export async function getScheduleRuns(scheduleId: string): Promise<OxylabsJobRun[]> {
  const response = await fetch(`${OXYLABS_DATA_API_BASE}/schedules/${scheduleId}/runs`, {
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch runs for schedule ${scheduleId}: ${response.status}`);
  }

  const rawText = await response.text();
  const data = parseBigIntsJSON(rawText);
  return data.runs || [];
}

export async function getJobResult(jobId: string): Promise<string> {
  const response = await fetch(`${OXYLABS_DATA_API_BASE}/jobs/${jobId}/results`, {
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch job result ${jobId}: ${response.status}`);
  }

  const rawText = await response.text();
  const data = parseBigIntsJSON(rawText);
  
  if (data.results && data.results.length > 0) {
    return data.results[0].content;
  }
  
  throw new Error("No content in scheduled job result");
}
