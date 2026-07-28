-- Seed data for active news sources
INSERT INTO sources (id, name, listing_url, parser_strategy, is_active, logo_url)
VALUES 
  (gen_random_uuid(), 'Reuters', 'https://www.reuters.com', 'default', true, null),
  (gen_random_uuid(), 'NPR', 'https://www.npr.org', 'default', true, null),
  (gen_random_uuid(), 'Fox News', 'https://www.foxnews.com', 'default', true, null),
  (gen_random_uuid(), 'BBC News', 'https://www.bbc.com/news', 'default', true, null),
  (gen_random_uuid(), 'The Guardian', 'https://www.theguardian.com/us', 'default', true, null);


-- Seed data for fallback articles and their AI analyses
DO $$
DECLARE
  reuters_id UUID;
  npr_id UUID;
  article1_id UUID := gen_random_uuid();
  article2_id UUID := gen_random_uuid();
BEGIN
  -- 1. Grab the generated UUIDs from the sources table
  SELECT id INTO reuters_id FROM sources WHERE name = 'Reuters' LIMIT 1;
  SELECT id INTO npr_id FROM sources WHERE name = 'NPR' LIMIT 1;

  -- 2. Insert into `articles`
  INSERT INTO articles (id, source_id, original_url, canonical_url, title, image_url, published_date, raw_text)
  VALUES 
    (article1_id, reuters_id, 'https://example.com/1', 'https://example.com/1', 'Global Summit Addresses Climate Targets for 2030', 'https://picsum.photos/seed/news1/800/600', NOW(), 'World leaders met today to discuss the upcoming climate targets and formulate a unified strategy to reduce carbon emissions across all participating nations.'),
    (article2_id, npr_id, 'https://example.com/2', 'https://example.com/2', 'Markets Rally Following Strong Tech Earnings', 'https://picsum.photos/seed/news2/800/600', NOW(), 'Technology stocks surged today as major companies reported earnings that vastly exceeded Wall Street expectations, driving overall market indices to record highs.');

  -- 3. Insert into `article_analyses`
  INSERT INTO article_analyses (article_id, summary, sentiment_score, sentiment_label, bias_score, bias_label, left_percentage, center_percentage, right_percentage, confidence, framing_notes, disclaimer, model)
  VALUES 
    (article1_id, 'Leaders discuss 2030 climate goals.', 0.2, 'neutral', -0.1, 'center', 30, 45, 25, 0.9, 'Focus on policy and diplomacy without extreme language.', 'AI generated analysis.', 'gpt-4'),
    (article2_id, 'Tech earnings drive market rally.', 0.8, 'positive', 0.3, 'right', 20, 30, 50, 0.85, 'Strong focus on economic growth and corporate success.', 'AI generated analysis.', 'gpt-4');
    
  -- 4. Mark them as analyzed so they show up on the frontend!
  UPDATE articles SET analyzed_at = NOW() WHERE id IN (article1_id, article2_id);

END $$;
