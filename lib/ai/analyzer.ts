import { generateText, embed } from 'ai';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { Article, InsertAnalysis } from '../supabase/queries/ai';

export const analysisSchema = z.object({
  summary: z.string().describe("A neutral, objective summary of the article."),
  sentiment_score: z.number().min(-1).max(1).describe("Sentiment score from -1 (very negative) to 1 (very positive)."),
  sentiment_label: z.enum(["positive", "neutral", "negative"]).describe("Overall sentiment category."),
  left_percentage: z.number().min(0).max(100).describe("Percentage of left-leaning framing."),
  center_percentage: z.number().min(0).max(100).describe("Percentage of centrist framing."),
  right_percentage: z.number().min(0).max(100).describe("Percentage of right-leaning framing."),
  confidence: z.number().min(0).max(1).describe("Confidence score of this analysis (0 to 1)."),
  framing_notes: z.string().describe("Explanation of the political framing or bias detected."),
  loaded_terms: z.array(z.string()).describe("List of emotionally charged or loaded terms used in the text.")
}).refine(data => {
  const total = data.left_percentage + data.center_percentage + data.right_percentage;
  return total >= 99 && total <= 101; // Allow small rounding differences
}, { message: "Percentages must sum to 100" });

export async function analyzeArticle(article: Article): Promise<InsertAnalysis | null> {
  const systemPrompt = `
    Analyze the following news article.
    Title: ${article.title}
    Text: ${article.raw_text}
    
    Determine its political framing percentages (left, center, right) which must sum to 100.
    Calculate the overall sentiment score (-1 to 1) and label (positive, neutral, negative).
    Identify loaded terms and provide framing notes based on objective text analysis.

    Return ONLY valid JSON. The output must strictly match this structure and contain NO markdown formatting:
    {
      "summary": "string",
      "sentiment_score": number,
      "sentiment_label": "positive" | "neutral" | "negative",
      "left_percentage": number,
      "center_percentage": number,
      "right_percentage": number,
      "confidence": number,
      "framing_notes": "string",
      "loaded_terms": ["string"]
    }
  `;

  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: systemPrompt,
    });

    const { embedding } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      value: `Title: ${article.title}\n\n${article.raw_text}`
    });

    let object;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      object = JSON.parse(match ? match[0] : text);
    } catch (e) {
      console.error("Failed to parse AI JSON output:", text);
      return null;
    }

    const bias_score = (object.right_percentage - object.left_percentage) / 100;
    
    let bias_label = 'center';
    const maxPercentage = Math.max(object.left_percentage, object.center_percentage, object.right_percentage);
    
    if (object.confidence < 0.4 || maxPercentage < 40) {
      bias_label = 'unclear';
    } else if (maxPercentage === object.left_percentage && maxPercentage === object.right_percentage) {
      bias_label = 'mixed';
    } else if (maxPercentage === object.left_percentage) {
      bias_label = 'left';
    } else if (maxPercentage === object.right_percentage) {
      bias_label = 'right';
    } else {
      bias_label = 'center';
    }

    return {
      article_id: article.id,
      summary: object.summary,
      sentiment_score: object.sentiment_score,
      sentiment_label: object.sentiment_label,
      bias_score,
      bias_label,
      left_percentage: object.left_percentage,
      center_percentage: object.center_percentage,
      right_percentage: object.right_percentage,
      confidence: object.confidence,
      framing_notes: object.framing_notes,
      loaded_terms: object.loaded_terms as unknown as any, // Cast to any to satisfy Supabase Json type
      disclaimer: "AI-estimated political framing based on article text.",
      model: 'llama-3.3-70b-versatile',
      embedding: JSON.stringify(embedding),
    };
  } catch (error) {
    console.error(`AI analysis failed for article ${article.id}:`, error);
    return null;
  }
}
