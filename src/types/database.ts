// =====================================================================
// Tipos de la base de datos de Supabase (en inglés y snake_case).
// Cuando tengas Supabase CLI configurado, puedes regenerar este archivo
// automáticamente con: npx supabase gen types typescript --project-id TU_ID
// =====================================================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          created_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string | null;
        };
        Relationships: [];
      };
      neighborhoods: {
        Row: {
          id: number;
          slug: string;
          name: string;
          district: string;
          city: string;
        };
        Insert: {
          slug: string;
          name: string;
          district: string;
          city?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          district?: string;
          city?: string;
        };
        Relationships: [];
      };
      venues: {
        Row: {
          id: string;
          slug: string;
          name: string;
          neighborhood_id: number;
          address: string;
          lat: number;
          lng: number;
          durum_price_cents: number | null;
          is_halal: boolean;
          has_vegetarian: boolean;
          has_delivery: boolean;
          cover_photo_path: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          neighborhood_id: number;
          address: string;
          lat: number;
          lng: number;
          durum_price_cents?: number | null;
          is_halal?: boolean;
          has_vegetarian?: boolean;
          has_delivery?: boolean;
          cover_photo_path?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['venues']['Insert']>;
        Relationships: [];
      };
      opening_hours: {
        Row: {
          id: number;
          venue_id: string;
          weekday: number;
          opens_at: string;
          closes_at: string;
        };
        Insert: {
          venue_id: string;
          weekday: number;
          opens_at: string;
          closes_at: string;
        };
        Update: Partial<Database['public']['Tables']['opening_hours']['Insert']>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          venue_id: string;
          user_id: string;
          meat: number;
          bread: number;
          sauces: number;
          freshness: number;
          value: number;
          night: number;
          comment: string;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          user_id: string;
          meat: number;
          bread: number;
          sauces: number;
          freshness: number;
          value: number;
          night: number;
          comment: string;
        };
        Update: {
          meat?: number;
          bread?: number;
          sauces?: number;
          freshness?: number;
          value?: number;
          night?: number;
          comment?: string;
        };
        Relationships: [];
      };
      review_photos: {
        Row: {
          id: string;
          review_id: string;
          storage_path: string;
          alt_text: string | null;
          width: number | null;
          height: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          storage_path: string;
          alt_text?: string | null;
          width?: number | null;
          height?: number | null;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      venue_scores: {
        Row: {
          venue_id: string;
          review_count: number;
          kebab_score: number | null;
          meat_avg: number | null;
          bread_avg: number | null;
          sauces_avg: number | null;
          freshness_avg: number | null;
          value_avg: number | null;
          night_avg: number | null;
          ranking_score: number;
        };
        Relationships: [];
      };
      user_stats: {
        Row: {
          user_id: string;
          username: string;
          review_count: number;
          neighborhood_count: number;
          first_review_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
  };
};
