export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      disciplines: {
        Row: {
          acronym: string
          created_at: string
          discipline_id: string
          name: string
          updated_at: string
        }
        Insert: {
          acronym: string
          created_at?: string
          discipline_id?: string
          name: string
          updated_at?: string
        }
        Update: {
          acronym?: string
          created_at?: string
          discipline_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      models_3d: {
        Row: {
          created_at: string
          model_id: string
          name: string
          slug: string
          thumbnail: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          model_id?: string
          name: string
          slug: string
          thumbnail?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          model_id?: string
          name?: string
          slug?: string
          thumbnail?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      models_3d_parameters: {
        Row: {
          created_at: string
          default_val: number
          label: string
          max_value: number
          min_value: number
          model_id: string
          name: string
          param_id: string
          step: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string
          default_val: number
          label: string
          max_value: number
          min_value: number
          model_id: string
          name: string
          param_id?: string
          step?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string
          default_val?: number
          label?: string
          max_value?: number
          min_value?: number
          model_id?: string
          name?: string
          param_id?: string
          step?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "models_3d_parameters_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models_3d"
            referencedColumns: ["model_id"]
          },
        ]
      }
      note_folders: {
        Row: {
          created_at: string
          folder_id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: Json
          created_at: string
          folder_id: string | null
          note_id: string
          source_url: string | null
          title: string
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          folder_id?: string | null
          note_id?: string
          source_url?: string | null
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          folder_id?: string | null
          note_id?: string
          source_url?: string | null
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["folder_id"]
          },
          {
            foreignKeyName: "notes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          difficulty: number | null
          difficulty_rating: number | null
          discrimination_rating: number | null
          options: Json
          question_id: string
          rationale: string | null
          text: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          difficulty_rating?: number | null
          discrimination_rating?: number | null
          options?: Json
          question_id?: string
          rationale?: string | null
          text: string
          topic_id: string
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          difficulty_rating?: number | null
          discrimination_rating?: number | null
          options?: Json
          question_id?: string
          rationale?: string | null
          text?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      quiz_sessions: {
        Row: {
          config: Json
          current_question_index: number
          discipline_id: string | null
          question_ids: string[]
          session_id: string
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          subject_ids: string[]
          test_mode: Database["public"]["Enums"]["test_mode"]
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          current_question_index?: number
          discipline_id?: string | null
          question_ids?: string[]
          session_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          subject_ids?: string[]
          test_mode?: Database["public"]["Enums"]["test_mode"]
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          current_question_index?: number
          discipline_id?: string | null
          question_ids?: string[]
          session_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          subject_ids?: string[]
          test_mode?: Database["public"]["Enums"]["test_mode"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["discipline_id"]
          },
        ]
      }
      readiness_score_snapshots: {
        Row: {
          computed_at: string
          score: number
          snapshot_id: string
          sub_scores: Json
          user_id: string
        }
        Insert: {
          computed_at?: string
          score: number
          snapshot_id?: string
          sub_scores?: Json
          user_id: string
        }
        Update: {
          computed_at?: string
          score?: number
          snapshot_id?: string
          sub_scores?: Json
          user_id?: string
        }
        Relationships: []
      }
      spatial_hotspots: {
        Row: {
          created_at: string
          description: string | null
          hotspot_id: string
          model_id: string
          node_id: string | null
          position_x: number
          position_y: number
          position_z: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hotspot_id?: string
          model_id: string
          node_id?: string | null
          position_x: number
          position_y: number
          position_z: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hotspot_id?: string
          model_id?: string
          node_id?: string | null
          position_x?: number
          position_y?: number
          position_z?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spatial_hotspots_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models_3d"
            referencedColumns: ["model_id"]
          },
          {
            foreignKeyName: "spatial_hotspots_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      taxonomy_tree: {
        Row: {
          created_at: string
          discipline_id: string
          is_leaf: boolean
          level: number
          name: string
          node_id: string
          parent_id: string | null
          slug: string | null
          subject_area: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discipline_id: string
          is_leaf?: boolean
          level: number
          name: string
          node_id?: string
          parent_id?: string | null
          slug?: string | null
          subject_area: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discipline_id?: string
          is_leaf?: boolean
          level?: number
          name?: string
          node_id?: string
          parent_id?: string | null
          slug?: string | null
          subject_area?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_tree_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["discipline_id"]
          },
          {
            foreignKeyName: "taxonomy_tree_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      user_global_stats: {
        Row: {
          current_discipline_id: string | null
          global_readiness_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_discipline_id?: string | null
          global_readiness_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_discipline_id?: string | null
          global_readiness_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_global_stats_current_discipline_id_fkey"
            columns: ["current_discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["discipline_id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          created_at: string
          interaction_id: string
          interaction_timestamp: string
          is_correct: boolean
          question_id: string
          selected_option_id: string | null
          session_id: string
          time_spent_ms: number | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          interaction_id?: string
          interaction_timestamp?: string
          is_correct: boolean
          question_id: string
          selected_option_id?: string | null
          session_id: string
          time_spent_ms?: number | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          interaction_id?: string
          interaction_timestamp?: string
          is_correct?: boolean
          question_id?: string
          selected_option_id?: string | null
          session_id?: string
          time_spent_ms?: number | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "user_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "user_interactions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      user_node_mastery: {
        Row: {
          avg_time_ms: number
          current_mastery_weight: number
          last_encountered: string
          topic_id: string
          total_attempts: number
          total_correct: number
          user_id: string
        }
        Insert: {
          avg_time_ms?: number
          current_mastery_weight?: number
          last_encountered?: string
          topic_id: string
          total_attempts?: number
          total_correct?: number
          user_id: string
        }
        Update: {
          avg_time_ms?: number
          current_mastery_weight?: number
          last_encountered?: string
          topic_id?: string
          total_attempts?: number
          total_correct?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_node_mastery_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          subscription_id: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_id?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_id?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wiki_article_taxonomy: {
        Row: {
          article_id: string
          is_primary: boolean | null
          node_id: string
        }
        Insert: {
          article_id: string
          is_primary?: boolean | null
          node_id: string
        }
        Update: {
          article_id?: string
          is_primary?: boolean | null
          node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_article_taxonomy_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["article_id"]
          },
          {
            foreignKeyName: "wiki_article_taxonomy_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      wiki_articles: {
        Row: {
          article_id: string
          content: string
          created_at: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          article_id?: string
          content: string
          created_at?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      feedback_channel:
        | "widget"
        | "post_quiz"
        | "hallucination_flag"
        | "wiki_flag"
        | "3d_perf_report"
        | "nps"
        | "churn_exit"
        | "feature_pulse"
        | "discord"
        | "ambassador"
        | "partner"
        | "app_store"
      feedback_feature_area:
        | "wiki"
        | "quiz"
        | "notes"
        | "3d_lab"
        | "ai_tutor"
        | "analytics"
        | "progression"
        | "auth"
        | "payments"
        | "onboarding"
        | "performance"
        | "content"
      feedback_priority: "P0" | "P1" | "P2" | "P3"
      feedback_status:
        | "new"
        | "triaged"
        | "in_progress"
        | "resolved"
        | "wont_fix"
        | "duplicate"
      session_status: "in_progress" | "completed" | "abandoned"
      subscription_status: "active" | "canceled" | "past_due" | "trialing"
      subscription_tier: "free" | "camp" | "insurance" | "institutional"
      test_mode:
        | "camp"
        | "storm"
        | "chill"
        | "custom"
        | "blindspot"
        | "proof_sim"
        | "endurance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      feedback_channel: [
        "widget",
        "post_quiz",
        "hallucination_flag",
        "wiki_flag",
        "3d_perf_report",
        "nps",
        "churn_exit",
        "feature_pulse",
        "discord",
        "ambassador",
        "partner",
        "app_store",
      ],
      feedback_feature_area: [
        "wiki",
        "quiz",
        "notes",
        "3d_lab",
        "ai_tutor",
        "analytics",
        "progression",
        "auth",
        "payments",
        "onboarding",
        "performance",
        "content",
      ],
      feedback_priority: ["P0", "P1", "P2", "P3"],
      feedback_status: [
        "new",
        "triaged",
        "in_progress",
        "resolved",
        "wont_fix",
        "duplicate",
      ],
      session_status: ["in_progress", "completed", "abandoned"],
      subscription_status: ["active", "canceled", "past_due", "trialing"],
      subscription_tier: ["free", "camp", "insurance", "institutional"],
      test_mode: [
        "camp",
        "storm",
        "chill",
        "custom",
        "blindspot",
        "proof_sim",
        "endurance",
      ],
    },
  },
} as const
