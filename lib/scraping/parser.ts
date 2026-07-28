import * as cheerio from 'cheerio';

const NON_ARTICLE_KEYWORDS = [
  '/category/', '/section/', '/sections/', '/topic/', '/tag/', '/author/',
  '/search', '/podcast/', '/live/', '/game/', '/product/', '/review/',
  '/support/', '/newsletter/', '/subscription/', '/video/', '/show/', '/program/',
  '/corporate/', '/about/', '/contact/', '/sports/', '/preference/', '/edition/',
  '/differentiator/'
];

export function isCandidateLink(href: string): boolean {
  if (!href) return false;
  
  const lowerHref = href.toLowerCase();
  
  for (const kw of NON_ARTICLE_KEYWORDS) {
    if (lowerHref.includes(kw)) {
      return false;
    }
  }
  
  // Articles usually have longer paths or digits (IDs/dates)
  try {
    const urlObj = new URL(href, 'https://example.com');
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 1) return false;
    
    const lastPart = pathParts[pathParts.length - 1];
    
    // Strict article check: slugs usually have hyphens or contain numbers (IDs)
    // Categories like /world/india/ usually don't.
    const hasHyphen = lastPart.includes('-');
    const hasDigit = /\d/.test(lastPart);
    
    if (!hasHyphen && !hasDigit) {
      return false; // Reject uncertain short paths
    }
  } catch (e) {
    return false;
  }
  
  return true; 
}

export function extractCandidateLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();
  
  // Only grab from main/article cards, avoid footer/nav
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      try {
        const urlObj = new URL(href, baseUrl);
        // Only keep links from the same domain
        if (urlObj.hostname === new URL(baseUrl).hostname) {
          // Normalise by removing hashes
          urlObj.hash = '';
          const cleanUrl = urlObj.toString();
          if (isCandidateLink(cleanUrl)) {
            links.add(cleanUrl);
          }
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    }
  });
  
  return Array.from(links);
}

export interface ParsedArticle {
  title: string;
  imageUrl: string;
  publishedDate: string;
  rawText: string;
  canonicalUrl: string | null;
}

export function parseArticleDetail(html: string, originalUrl: string): ParsedArticle | null {
  const $ = cheerio.load(html);
  
  // Clean up garbage
  $('script, style, nav, footer, header, .ad, .advertisement, .newsletter, .subscription, .related, .social-share, form, iframe').remove();
  
  const canonicalUrl = $('link[rel="canonical"]').attr('href') || null;
  
  // Title
  let title = $('meta[property="og:title"]').attr('content') || $('title').text() || $('h1').first().text();
  title = title.trim();
  
  if (!title || title.toLowerCase().includes("category") || title.toLowerCase().includes("section")) {
    return null; // Invalid title
  }
  
  // Image
  const imageUrl = $('meta[property="og:image"]').attr('content') || $('meta[property="twitter:image"]').attr('content');
  if (!imageUrl) {
    return null; // Required image missing
  }
  
  // Published Date
  const publishedDate = $('meta[property="article:published_time"]').attr('content') || 
                        $('meta[name="date"]').attr('content') || 
                        $('time').attr('datetime');
                        
  if (!publishedDate) {
    return null; // Required date missing
  }
  
  // Body Extraction
  let bodyText = '';
  const paragraphs = $('p');
  
  paragraphs.each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 50) {
      bodyText += text + '\n\n';
    }
  });
  
  bodyText = bodyText.trim();
  
  const paragraphCount = bodyText.split('\n\n').length;
  
  if (paragraphCount < 3 && bodyText.length < 900) {
    return null; // Content gate failed
  }
  
  return {
    title,
    imageUrl,
    publishedDate,
    rawText: bodyText,
    canonicalUrl
  };
}
