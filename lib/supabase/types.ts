export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string
          name: string
          listing_url: string
          parser_strategy: string | null
          is_active: boolean
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          listing_url: string
          parser_strategy?: string | null
          is_active?: boolean
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          listing_url?: string
          parser_strategy?: string | null
          is_active?: boolean
          logo_url?: string | null
          created_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          source_id: string
          original_url: string
          canonical_url: string | null
          title: string
          image_url: string
          published_date: string
          raw_text: string
          scraped_at: string
          analyzed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          source_id: string
          original_url: string
          canonical_url?: string | null
          title: string
          image_url: string
          published_date: string
          raw_text: string
          scraped_at?: string
          analyzed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          source_id?: string
          original_url?: string
          canonical_url?: string | null
          title?: string
          image_url?: string
          published_date?: string
          raw_text?: string
          scraped_at?: string
          analyzed_at?: string | null
          created_at?: string
        }
      }
      article_analyses: {
        Row: {
          id: string
          article_id: string
          summary: string
          sentiment_score: number
          sentiment_label: string
          bias_score: number
          bias_label: string
          left_percentage: number
          center_percentage: number
          right_percentage: number
          confidence: number
          framing_notes: string | null
          loaded_terms: Json | null
          disclaimer: string | null
          model: string
          embedding: string | null
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          summary: string
          sentiment_score: number
          sentiment_label: string
          bias_score: number
          bias_label: string
          left_percentage: number
          center_percentage: number
          right_percentage: number
          confidence: number
          framing_notes?: string | null
          loaded_terms?: Json | null
          disclaimer?: string | null
          model: string
          embedding?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          summary?: string
          sentiment_score?: number
          sentiment_label?: string
          bias_score?: number
          bias_label?: string
          left_percentage?: number
          center_percentage?: number
          right_percentage?: number
          confidence?: number
          framing_notes?: string | null
          loaded_terms?: Json | null
          disclaimer?: string | null
          model?: string
          embedding?: string | null
          created_at?: string
        }
      }
      logs: {
        Row: {
          id: string
          type: string
          message: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          message: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          message?: string
          details?: Json | null
          created_at?: string
        }
      }
      oxylabs_schedules: {
        Row: {
          id: string
          oxylabs_schedule_id: string
          source_id: string
          created_at: string
        }
        Insert: {
          id?: string
          oxylabs_schedule_id: string
          source_id: string
          created_at?: string
        }
        Update: {
          id?: string
          oxylabs_schedule_id?: string
          source_id?: string
          created_at?: string
        }
      }
      oxylabs_schedule_runs: {
        Row: {
          id: string
          schedule_id: string
          run_id: string
          status: string
          result_html: string | null
          created_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          run_id: string
          status: string
          result_html?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          run_id?: string
          status?: string
          result_html?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_articles: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          p_article_id: string
        }
        Returns: {
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
