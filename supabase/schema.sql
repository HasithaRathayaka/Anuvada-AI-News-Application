-- Create extension for pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Table: sources
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  listing_url TEXT NOT NULL,
  parser_strategy TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  original_url TEXT UNIQUE NOT NULL,
  canonical_url TEXT,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  published_date TIMESTAMPTZ NOT NULL,
  raw_text TEXT NOT NULL,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: article_analyses
CREATE TABLE article_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL UNIQUE REFERENCES articles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  sentiment_score NUMERIC NOT NULL,
  sentiment_label TEXT NOT NULL,
  bias_score NUMERIC NOT NULL,
  bias_label TEXT NOT NULL,
  left_percentage NUMERIC NOT NULL,
  center_percentage NUMERIC NOT NULL,
  right_percentage NUMERIC NOT NULL,
  confidence NUMERIC NOT NULL,
  framing_notes TEXT,
  loaded_terms JSONB,
  disclaimer TEXT,
  model TEXT NOT NULL,
  embedding vector(3072),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: logs
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: oxylabs_schedules
CREATE TABLE oxylabs_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oxylabs_schedule_id TEXT UNIQUE NOT NULL,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: oxylabs_schedule_runs
CREATE TABLE oxylabs_schedule_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES oxylabs_schedules(id) ON DELETE CASCADE,
  run_id TEXT NOT NULL,
  status TEXT NOT NULL,
  result_html TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(schedule_id, run_id)
);

-- Row Level Security (RLS) Policies
-- Enable RLS on all public tables
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oxylabs_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE oxylabs_schedule_runs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to data needed by the UI
CREATE POLICY "Allow public read access on sources" ON sources FOR SELECT USING (true);
CREATE POLICY "Allow public read access on articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow public read access on article_analyses" ON article_analyses FOR SELECT USING (true);

-- (Logs and oxylabs schedules remain restricted to service_role only by default since they have no public policies)

-- RPC function for semantic search of related articles
CREATE OR REPLACE FUNCTION match_articles (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  p_article_id uuid
)
RETURNS TABLE (
  id uuid,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    article_analyses.article_id AS id,
    1 - (article_analyses.embedding <=> query_embedding) AS similarity
  FROM article_analyses
  WHERE article_analyses.article_id != p_article_id
  AND 1 - (article_analyses.embedding <=> query_embedding) > match_threshold
  ORDER BY article_analyses.embedding <=> query_embedding
  LIMIT match_count;
$$;
