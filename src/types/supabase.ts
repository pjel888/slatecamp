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
      admin_draft_previews: {
        Row: {
          article_id: string | null
          content: string
          created_at: string
          id: string
        }
        Insert: {
          article_id?: string | null
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          article_id?: string | null
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_draft_previews_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["article_id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          event_properties: Json | null
          id: string
          page_path: string | null
          referrer: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          event_properties?: Json | null
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          event_properties?: Json | null
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      anon_diagnostic_sessions: {
        Row: {
          anon_session_id: string
          answers: Json
          browser_session_id: string
          converted_user_id: string | null
          expires_at: string
          question_ids: string[]
          questions_answered: number
          started_at: string
        }
        Insert: {
          anon_session_id?: string
          answers?: Json
          browser_session_id: string
          converted_user_id?: string | null
          expires_at?: string
          question_ids?: string[]
          questions_answered?: number
          started_at?: string
        }
        Update: {
          anon_session_id?: string
          answers?: Json
          browser_session_id?: string
          converted_user_id?: string | null
          expires_at?: string
          question_ids?: string[]
          questions_answered?: number
          started_at?: string
        }
        Relationships: []
      }
      behavioral_features: {
        Row: {
          assessment_context: Json | null
          created_at: string | null
          dwell_times: Json | null
          feature_id: string
          interaction_id: string
          interaction_path_metric: number
          is_deliberate: boolean | null
          jerk_metric: number | null
          micropatterns: Json | null
          path_deviation: number | null
          pressure_mean: number | null
          pressure_variance: number | null
          reversal_count: number | null
          temporal_metric: number
          velocity_max: number | null
          velocity_mean: number | null
          velocity_std_dev: number | null
        }
        Insert: {
          assessment_context?: Json | null
          created_at?: string | null
          dwell_times?: Json | null
          feature_id?: string
          interaction_id: string
          interaction_path_metric: number
          is_deliberate?: boolean | null
          jerk_metric?: number | null
          micropatterns?: Json | null
          path_deviation?: number | null
          pressure_mean?: number | null
          pressure_variance?: number | null
          reversal_count?: number | null
          temporal_metric: number
          velocity_max?: number | null
          velocity_mean?: number | null
          velocity_std_dev?: number | null
        }
        Update: {
          assessment_context?: Json | null
          created_at?: string | null
          dwell_times?: Json | null
          feature_id?: string
          interaction_id?: string
          interaction_path_metric?: number
          is_deliberate?: boolean | null
          jerk_metric?: number | null
          micropatterns?: Json | null
          path_deviation?: number | null
          pressure_mean?: number | null
          pressure_variance?: number | null
          reversal_count?: number | null
          temporal_metric?: number
          velocity_max?: number | null
          velocity_mean?: number | null
          velocity_std_dev?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_features_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "user_interactions"
            referencedColumns: ["interaction_id"]
          },
        ]
      }
      focus_review_queues: {
        Row: {
          completed_at: string | null
          deferred_until: string | null
          generated_at: string | null
          node_ids: string[]
          nodes_improved: number | null
          post_queue_mastery: Json | null
          pre_queue_mastery: Json | null
          question_count: number | null
          queue_id: string
          recommendation_type: string | null
          session_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          deferred_until?: string | null
          generated_at?: string | null
          node_ids: string[]
          nodes_improved?: number | null
          post_queue_mastery?: Json | null
          pre_queue_mastery?: Json | null
          question_count?: number | null
          queue_id?: string
          recommendation_type?: string | null
          session_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          deferred_until?: string | null
          generated_at?: string | null
          node_ids?: string[]
          nodes_improved?: number | null
          post_queue_mastery?: Json | null
          pre_queue_mastery?: Json | null
          question_count?: number | null
          queue_id?: string
          recommendation_type?: string | null
          session_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cage_binding_tokens: {
        Row: {
          behavioral_attestation: string
          created_at: string | null
          interaction_id: string
          nonce: string
          previous_token_hash: string | null
          question_id: string
          response_hash: string
          sequence_number: number
          session_id: string
          signature: string
          token_id: string
          trust_level: string
          verified_at: string | null
        }
        Insert: {
          behavioral_attestation: string
          created_at?: string | null
          interaction_id: string
          nonce: string
          previous_token_hash?: string | null
          question_id: string
          response_hash: string
          sequence_number: number
          session_id: string
          signature: string
          token_id: string
          trust_level: string
          verified_at?: string | null
        }
        Update: {
          behavioral_attestation?: string
          created_at?: string | null
          interaction_id?: string
          nonce?: string
          previous_token_hash?: string | null
          question_id?: string
          response_hash?: string
          sequence_number?: number
          session_id?: string
          signature?: string
          token_id?: string
          trust_level?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      camp_trails: {
        Row: {
          created_at: string
          daily_time_estimate_minutes: number
          description: string | null
          discipline_id: string
          duration_days: number
          intensity: Database["public"]["Enums"]["trail_intensity"] | null
          is_featured: boolean
          is_free: boolean
          is_published: boolean
          name: string
          recommended_max_score: number | null
          recommended_min_score: number | null
          slug: string
          subjects_covered: string[] | null
          total_steps: number
          trail_id: string
          trail_type: Database["public"]["Enums"]["trail_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_time_estimate_minutes?: number
          description?: string | null
          discipline_id: string
          duration_days: number
          intensity?: Database["public"]["Enums"]["trail_intensity"] | null
          is_featured?: boolean
          is_free?: boolean
          is_published?: boolean
          name: string
          recommended_max_score?: number | null
          recommended_min_score?: number | null
          slug: string
          subjects_covered?: string[] | null
          total_steps?: number
          trail_id?: string
          trail_type: Database["public"]["Enums"]["trail_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_time_estimate_minutes?: number
          description?: string | null
          discipline_id?: string
          duration_days?: number
          intensity?: Database["public"]["Enums"]["trail_intensity"] | null
          is_featured?: boolean
          is_free?: boolean
          is_published?: boolean
          name?: string
          recommended_max_score?: number | null
          recommended_min_score?: number | null
          slug?: string
          subjects_covered?: string[] | null
          total_steps?: number
          trail_id?: string
          trail_type?: Database["public"]["Enums"]["trail_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "camp_trails_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["discipline_id"]
          },
        ]
      }
      campfire_testimonials: {
        Row: {
          created_at: string
          display_name: string
          exam_batch: string
          final_score: number | null
          is_featured: boolean
          is_verified: boolean
          passed: boolean
          quote: string | null
          school_name: string | null
          starting_score: number | null
          testimonial_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          exam_batch: string
          final_score?: number | null
          is_featured?: boolean
          is_verified?: boolean
          passed: boolean
          quote?: string | null
          school_name?: string | null
          starting_score?: number | null
          testimonial_id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          exam_batch?: string
          final_score?: number | null
          is_featured?: boolean
          is_verified?: boolean
          passed?: boolean
          quote?: string | null
          school_name?: string | null
          starting_score?: number | null
          testimonial_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campfire_testimonials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campfire_testimonials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_capabilities"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ceo_cash_balance_entries: {
        Row: {
          amount_php: number
          balance_date: string
          created_at: string
          created_by: string
          id: string
          notes: string | null
        }
        Insert: {
          amount_php: number
          balance_date: string
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
        }
        Update: {
          amount_php?: number
          balance_date?: string
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      ceo_financial_entries: {
        Row: {
          amount_php: number
          category: string
          created_at: string
          created_by: string
          description: string | null
          entry_date: string
          entry_type: Database["public"]["Enums"]["financial_entry_type"]
          id: string
          is_recurring: boolean
          updated_at: string
        }
        Insert: {
          amount_php: number
          category: string
          created_at?: string
          created_by?: string
          description?: string | null
          entry_date: string
          entry_type: Database["public"]["Enums"]["financial_entry_type"]
          id?: string
          is_recurring?: boolean
          updated_at?: string
        }
        Update: {
          amount_php?: number
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          entry_date?: string
          entry_type?: Database["public"]["Enums"]["financial_entry_type"]
          id?: string
          is_recurring?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ceo_gate_status: {
        Row: {
          created_at: string
          created_by: string
          entered_at: string
          exit_conditions_met: Json
          gate_number: number
          id: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string
          entered_at?: string
          exit_conditions_met?: Json
          gate_number: number
          id?: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          entered_at?: string
          exit_conditions_met?: Json
          gate_number?: number
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      ceo_team_members: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["team_department"]
          display_name: string
          end_date: string | null
          id: string
          monthly_cost_php: number | null
          role_title: string
          start_date: string
          system_role: Database["public"]["Enums"]["system_role_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department: Database["public"]["Enums"]["team_department"]
          display_name: string
          end_date?: string | null
          id?: string
          monthly_cost_php?: number | null
          role_title: string
          start_date: string
          system_role?: Database["public"]["Enums"]["system_role_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["team_department"]
          display_name?: string
          end_date?: string | null
          id?: string
          monthly_cost_php?: number | null
          role_title?: string
          start_date?: string
          system_role?: Database["public"]["Enums"]["system_role_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ceo_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ceo_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_capabilities"
            referencedColumns: ["user_id"]
          },
        ]
      }
      code_updates: {
        Row: {
          effective_date: string | null
          is_lea_testable: boolean
          lea_id: string | null
          new_value: string | null
          previous_value: string | null
          published_at: string
          summary: string
          update_id: string
        }
        Insert: {
          effective_date?: string | null
          is_lea_testable?: boolean
          lea_id?: string | null
          new_value?: string | null
          previous_value?: string | null
          published_at?: string
          summary: string
          update_id?: string
        }
        Update: {
          effective_date?: string | null
          is_lea_testable?: boolean
          lea_id?: string | null
          new_value?: string | null
          previous_value?: string | null
          published_at?: string
          summary?: string
          update_id?: string
        }
        Relationships: []
      }
      confusion_pairs: {
        Row: {
          co_failure_rate: number
          detected_at: string
          disambiguation_article_id: string | null
          id: string
          sample_size: number
          topic_a: string
          topic_b: string
        }
        Insert: {
          co_failure_rate: number
          detected_at?: string
          disambiguation_article_id?: string | null
          id?: string
          sample_size: number
          topic_a: string
          topic_b: string
        }
        Update: {
          co_failure_rate?: number
          detected_at?: string
          disambiguation_article_id?: string | null
          id?: string
          sample_size?: number
          topic_a?: string
          topic_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "confusion_pairs_disambiguation_article_id_fkey"
            columns: ["disambiguation_article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["article_id"]
          },
          {
            foreignKeyName: "confusion_pairs_topic_a_fkey"
            columns: ["topic_a"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
          {
            foreignKeyName: "confusion_pairs_topic_b_fkey"
            columns: ["topic_b"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      daily_doses: {
        Row: {
          activities: Json
          completed_at: string | null
          created_at: string
          dose_date: string
          estimated_minutes: number
          id: string
          rationale: string | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          activities: Json
          completed_at?: string | null
          created_at?: string
          dose_date: string
          estimated_minutes: number
          id?: string
          rationale?: string | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          activities?: Json
          completed_at?: string | null
          created_at?: string
          dose_date?: string
          estimated_minutes?: number
          id?: string
          rationale?: string | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      design_problem_sessions: {
        Row: {
          checklist_completion: Json | null
          completed_at: string | null
          problem_id: string
          self_assessment_score: number | null
          session_id: string
          started_at: string
          time_elapsed_seconds: number | null
          user_id: string
        }
        Insert: {
          checklist_completion?: Json | null
          completed_at?: string | null
          problem_id: string
          self_assessment_score?: number | null
          session_id?: string
          started_at?: string
          time_elapsed_seconds?: number | null
          user_id: string
        }
        Update: {
          checklist_completion?: Json | null
          completed_at?: string | null
          problem_id?: string
          self_assessment_score?: number | null
          session_id?: string
          started_at?: string
          time_elapsed_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_problem_sessions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "design_problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      design_problems: {
        Row: {
          brief: string
          building_type: string
          code_references: string[] | null
          created_at: string
          difficulty: number | null
          is_published: boolean
          problem_id: string
          program: Json
          site_data: Json
          time_limit_minutes: number | null
          title: string
        }
        Insert: {
          brief: string
          building_type: string
          code_references?: string[] | null
          created_at?: string
          difficulty?: number | null
          is_published?: boolean
          problem_id?: string
          program?: Json
          site_data?: Json
          time_limit_minutes?: number | null
          title: string
        }
        Update: {
          brief?: string
          building_type?: string
          code_references?: string[] | null
          created_at?: string
          difficulty?: number | null
          is_published?: boolean
          problem_id?: string
          program?: Json
          site_data?: Json
          time_limit_minutes?: number | null
          title?: string
        }
        Relationships: []
      }
      design_questions: {
        Row: {
          bloom_level: string | null
          code_citation: string | null
          correct_answer_index: number
          created_at: string
          difficulty: number | null
          is_trap_question: boolean
          number: number
          options: Json
          question_id: string
          question_stem: string
          rationale: Json | null
          scenario_id: string
          solution_steps: string[]
          updated_at: string
          wiki_ref: string | null
        }
        Insert: {
          bloom_level?: string | null
          code_citation?: string | null
          correct_answer_index: number
          created_at?: string
          difficulty?: number | null
          is_trap_question?: boolean
          number: number
          options?: Json
          question_id?: string
          question_stem: string
          rationale?: Json | null
          scenario_id: string
          solution_steps?: string[]
          updated_at?: string
          wiki_ref?: string | null
        }
        Update: {
          bloom_level?: string | null
          code_citation?: string | null
          correct_answer_index?: number
          created_at?: string
          difficulty?: number | null
          is_trap_question?: boolean
          number?: number
          options?: Json
          question_id?: string
          question_stem?: string
          rationale?: Json | null
          scenario_id?: string
          solution_steps?: string[]
          updated_at?: string
          wiki_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_questions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "design_problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      design_scenario_interactions: {
        Row: {
          created_at: string | null
          fell_for_trap: boolean | null
          interaction_id: string
          is_correct: boolean
          question_id: string | null
          scenario_id: string | null
          selected_answer_index: number | null
          session_id: string | null
          time_spent_ms: number | null
          trap_id: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fell_for_trap?: boolean | null
          interaction_id?: string
          is_correct: boolean
          question_id?: string | null
          scenario_id?: string | null
          selected_answer_index?: number | null
          session_id?: string | null
          time_spent_ms?: number | null
          trap_id?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          fell_for_trap?: boolean | null
          interaction_id?: string
          is_correct?: boolean
          question_id?: string | null
          scenario_id?: string | null
          selected_answer_index?: number | null
          session_id?: string | null
          time_spent_ms?: number | null
          trap_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_scenario_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "design_scenario_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      design_scenario_questions: {
        Row: {
          code_citation: string | null
          correct_answer_index: number
          created_at: string | null
          difficulty_rating: number | null
          discrimination_rating: number | null
          options: Json
          question_id: string
          question_number: number
          question_stem: string
          question_type: string | null
          rationale: Json | null
          scenario_id: string
          solution_steps: string[] | null
        }
        Insert: {
          code_citation?: string | null
          correct_answer_index: number
          created_at?: string | null
          difficulty_rating?: number | null
          discrimination_rating?: number | null
          options: Json
          question_id: string
          question_number: number
          question_stem: string
          question_type?: string | null
          rationale?: Json | null
          scenario_id: string
          solution_steps?: string[] | null
        }
        Update: {
          code_citation?: string | null
          correct_answer_index?: number
          created_at?: string | null
          difficulty_rating?: number | null
          discrimination_rating?: number | null
          options?: Json
          question_id?: string
          question_number?: number
          question_stem?: string
          question_type?: string | null
          rationale?: Json | null
          scenario_id?: string
          solution_steps?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "design_scenario_questions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "design_scenarios"
            referencedColumns: ["scenario_id"]
          },
        ]
      }
      design_scenario_sessions: {
        Row: {
          answers: Json | null
          completed_at: string | null
          scenario_id: string
          score: number | null
          session_id: string
          started_at: string | null
          time_elapsed_seconds: number | null
          total_questions: number | null
          traps_fallen_into: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          scenario_id: string
          score?: number | null
          session_id?: string
          started_at?: string | null
          time_elapsed_seconds?: number | null
          total_questions?: number | null
          traps_fallen_into?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          scenario_id?: string
          score?: number | null
          session_id?: string
          started_at?: string | null
          time_elapsed_seconds?: number | null
          total_questions?: number | null
          traps_fallen_into?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_scenario_sessions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "design_scenarios"
            referencedColumns: ["scenario_id"]
          },
        ]
      }
      design_scenarios: {
        Row: {
          brief: string
          building_type: string
          code_references: string[] | null
          computation_sheet: Json | null
          created_at: string | null
          difficulty: string
          hidden_traps: Json | null
          program: Json | null
          scenario_id: string
          site_data: Json | null
          time_limit_minutes: number | null
          title: string
          trap_count: number | null
        }
        Insert: {
          brief: string
          building_type: string
          code_references?: string[] | null
          computation_sheet?: Json | null
          created_at?: string | null
          difficulty: string
          hidden_traps?: Json | null
          program?: Json | null
          scenario_id: string
          site_data?: Json | null
          time_limit_minutes?: number | null
          title: string
          trap_count?: number | null
        }
        Update: {
          brief?: string
          building_type?: string
          code_references?: string[] | null
          computation_sheet?: Json | null
          created_at?: string | null
          difficulty: string
          hidden_traps?: Json | null
          program?: Json | null
          scenario_id?: string
          site_data?: Json | null
          time_limit_minutes?: number | null
          title?: string
          trap_count?: number | null
        }
        Relationships: []
      }
      disciplines: {
        Row: {
          acronym: string
          created_at: string
          discipline_id: string
          exam_day_1_subjects: string[] | null
          exam_day_2_subjects: string[] | null
          name: string
          passing_threshold_pct: number
          recent_passing_rates: Json | null
          subject_floor_pct: number
          updated_at: string
        }
        Insert: {
          acronym: string
          created_at?: string
          discipline_id?: string
          exam_day_1_subjects?: string[] | null
          exam_day_2_subjects?: string[] | null
          name: string
          passing_threshold_pct?: number
          recent_passing_rates?: Json | null
          subject_floor_pct?: number
          updated_at?: string
        }
        Update: {
          acronym?: string
          created_at?: string
          discipline_id?: string
          exam_day_1_subjects?: string[] | null
          exam_day_2_subjects?: string[] | null
          name?: string
          passing_threshold_pct?: number
          recent_passing_rates?: Json | null
          subject_floor_pct?: number
          updated_at?: string
        }
        Relationships: []
      }
      exam_outcomes: {
        Row: {
          avg_session_accuracy: number | null
          created_at: string | null
          customer_archetype: string | null
          days_active: number | null
          discipline_id: string | null
          exam_batch: string
          outcome_id: string
          peak_readiness_score: number | null
          readiness_score_at_7d_before: number | null
          reported_at: string | null
          result: string
          self_reported_score: number | null
          signup_source: string | null
          total_questions_answered: number | null
          total_sessions_completed: number | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          avg_session_accuracy?: number | null
          created_at?: string | null
          customer_archetype?: string | null
          days_active?: number | null
          discipline_id?: string | null
          exam_batch: string
          outcome_id?: string
          peak_readiness_score?: number | null
          readiness_score_at_7d_before?: number | null
          reported_at?: string | null
          result: string
          self_reported_score?: number | null
          signup_source?: string | null
          total_questions_answered?: number | null
          total_sessions_completed?: number | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          avg_session_accuracy?: number | null
          created_at?: string | null
          customer_archetype?: string | null
          days_active?: number | null
          discipline_id?: string | null
          exam_batch?: string
          outcome_id?: string
          peak_readiness_score?: number | null
          readiness_score_at_7d_before?: number | null
          reported_at?: string | null
          result?: string
          self_reported_score?: number | null
          signup_source?: string | null
          total_questions_answered?: number | null
          total_sessions_completed?: number | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_outcomes_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["discipline_id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean
          id: string
          key: string
          target_roles: string[] | null
          target_tier: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          target_roles?: string[] | null
          target_tier?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          target_roles?: string[] | null
          target_tier?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      models_3d: {
        Row: {
          context_scenario: string | null
          created_at: string
          has_challenge_mode: boolean
          lea_question_count: number | null
          lea_question_type: string | null
          metadata: Json | null
          model_id: string
          name: string
          reviewed_at: string | null
          reviewed_by: string | null
          slug: string
          status: string | null
          supported_phases: string[] | null
          thumbnail: string | null
          updated_at: string
          url: string
        }
        Insert: {
          context_scenario?: string | null
          created_at?: string
          has_challenge_mode?: boolean
          lea_question_count?: number | null
          lea_question_type?: string | null
          metadata?: Json | null
          model_id?: string
          name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug: string
          status?: string | null
          supported_phases?: string[] | null
          thumbnail?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          context_scenario?: string | null
          created_at?: string
          has_challenge_mode?: boolean
          lea_question_count?: number | null
          lea_question_type?: string | null
          metadata?: Json | null
          model_id?: string
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug?: string
          status?: string | null
          supported_phases?: string[] | null
          thumbnail?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
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
          article_id: string | null
          color: string | null
          content: Json
          created_at: string
          folder_id: string | null
          is_pinned: boolean
          note_id: string
          note_type: string
          question_id: string | null
          session_id: string | null
          source_url: string | null
          tags: string[] | null
          title: string
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id?: string | null
          color?: string | null
          content?: Json
          created_at?: string
          folder_id?: string | null
          is_pinned?: boolean
          note_id?: string
          note_type?: string
          question_id?: string | null
          session_id?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string | null
          color?: string | null
          content?: Json
          created_at?: string
          folder_id?: string | null
          is_pinned?: boolean
          note_id?: string
          note_type?: string
          question_id?: string | null
          session_id?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["article_id"]
          },
          {
            foreignKeyName: "notes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["folder_id"]
          },
          {
            foreignKeyName: "notes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["session_id"]
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
      notification_log: {
        Row: {
          channel: string
          delivery_status: string | null
          log_id: string
          sent_at: string
          trigger_type: string
          user_id: string
        }
        Insert: {
          channel: string
          delivery_status?: string | null
          log_id?: string
          sent_at?: string
          trigger_type: string
          user_id: string
        }
        Update: {
          channel?: string
          delivery_status?: string | null
          log_id?: string
          sent_at?: string
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          billing: boolean
          focus_review: boolean
          campfire: boolean
          coaching_tips: boolean
          content_updates: boolean
          created_at: string
          daily_digest: boolean
          id: string
          milestones: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          score_changes: boolean
          trail_ready: boolean
          updated_at: string
          user_id: string
          weekly_digest: boolean
        }
        Insert: {
          billing?: boolean
          focus_review?: boolean
          campfire?: boolean
          coaching_tips?: boolean
          content_updates?: boolean
          created_at?: string
          daily_digest?: boolean
          id?: string
          milestones?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          score_changes?: boolean
          trail_ready?: boolean
          updated_at?: string
          user_id: string
          weekly_digest?: boolean
        }
        Update: {
          billing?: boolean
          focus_review?: boolean
          campfire?: boolean
          coaching_tips?: boolean
          content_updates?: boolean
          created_at?: string
          daily_digest?: boolean
          id?: string
          milestones?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          score_changes?: boolean
          trail_ready?: boolean
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          metadata: Json
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      oath_taking_schedules: {
        Row: {
          created_at: string
          oath_date: string
          region: string
          schedule_id: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          oath_date: string
          region: string
          schedule_id?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          oath_date?: string
          region?: string
          schedule_id?: string
          venue?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          joined_at: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          org_id: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["org_id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          logo_url: string | null
          max_seats: number
          name: string
          org_id: string
          slug: string
          type: Database["public"]["Enums"]["user_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          logo_url?: string | null
          max_seats?: number
          name: string
          org_id?: string
          slug: string
          type?: Database["public"]["Enums"]["user_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          logo_url?: string | null
          max_seats?: number
          name?: string
          org_id?: string
          slug?: string
          type?: Database["public"]["Enums"]["user_type"]
          updated_at?: string
        }
        Relationships: []
      }
      pod_members: {
        Row: {
          joined_at: string
          pod_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          pod_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          pod_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pod_members_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "study_pods"
            referencedColumns: ["pod_id"]
          },
        ]
      }
      processed_webhook_events: {
        Row: {
          event_id: string
          event_type: string | null
          id: string
          processed_at: string
          provider: string
        }
        Insert: {
          event_id: string
          event_type?: string | null
          id?: string
          processed_at?: string
          provider: string
        }
        Update: {
          event_id?: string
          event_type?: string | null
          id?: string
          processed_at?: string
          provider?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_mode: string | null
          avatar_url: string | null
          comp_exam_date: string | null
          comp_exam_scores: Json | null
          created_at: string | null
          dae_contexts_updated_at: string | null
          dae_work_contexts: string[] | null
          display_name: string | null
          enrolled_review_center: string | null
          full_name: string | null
          id: string
          lea_result: string | null
          oath_taking_date: string | null
          onboarding_completed_at: string | null
          preferred_study_window: string | null
          previous_exam_subjects_struggled: Json | null
          region: string | null
          reviewer_type: string | null
          role: string | null
          school_name: string | null
          school_or_institution: string | null
          target_exam_date: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          account_mode?: string | null
          avatar_url?: string | null
          comp_exam_date?: string | null
          comp_exam_scores?: Json | null
          created_at?: string | null
          dae_contexts_updated_at?: string | null
          dae_work_contexts?: string[] | null
          display_name?: string | null
          enrolled_review_center?: string | null
          full_name?: string | null
          id: string
          lea_result?: string | null
          oath_taking_date?: string | null
          onboarding_completed_at?: string | null
          preferred_study_window?: string | null
          previous_exam_subjects_struggled?: Json | null
          region?: string | null
          reviewer_type?: string | null
          role?: string | null
          school_name?: string | null
          school_or_institution?: string | null
          target_exam_date?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          account_mode?: string | null
          avatar_url?: string | null
          comp_exam_date?: string | null
          comp_exam_scores?: Json | null
          created_at?: string | null
          dae_contexts_updated_at?: string | null
          dae_work_contexts?: string[] | null
          display_name?: string | null
          enrolled_review_center?: string | null
          full_name?: string | null
          id?: string
          lea_result?: string | null
          oath_taking_date?: string | null
          onboarding_completed_at?: string | null
          preferred_study_window?: string | null
          previous_exam_subjects_struggled?: Json | null
          region?: string | null
          reviewer_type?: string | null
          role?: string | null
          school_name?: string | null
          school_or_institution?: string | null
          target_exam_date?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          accepted_answers: string[] | null
          application_context: string | null
          article_id: string | null
          bloom_level: string | null
          code_citation: string | null
          correct_option_id: string
          correct_value: number | null
          created_at: string
          difficulty: number | null
          difficulty_rating: number | null
          discrimination_rating: number | null
          explanation: string | null
          hint_text: string | null
          irt_calibrated_at: string | null
          irt_difficulty: number | null
          irt_discrimination: number | null
          irt_guessing: number | null
          is_assessment: boolean | null
          model_id: string | null
          normalization_log: Json | null
          normalization_run_at: string | null
          normalization_status: string | null
          options: Json
          practice_context: string[] | null
          prompt_image_url: string | null
          question_id: string
          question_type: string | null
          rationale: Json | null
          text: string
          topic_id: string
          updated_at: string
          value_tolerance: number | null
        }
        Insert: {
          accepted_answers?: string[] | null
          application_context?: string | null
          article_id?: string | null
          bloom_level?: string | null
          code_citation?: string | null
          correct_option_id: string
          correct_value?: number | null
          created_at?: string
          difficulty?: number | null
          difficulty_rating?: number | null
          discrimination_rating?: number | null
          explanation?: string | null
          hint_text?: string | null
          irt_calibrated_at?: string | null
          irt_difficulty?: number | null
          irt_discrimination?: number | null
          irt_guessing?: number | null
          is_assessment?: boolean | null
          model_id?: string | null
          normalization_log?: Json | null
          normalization_run_at?: string | null
          normalization_status?: string | null
          options: Json
          practice_context?: string[] | null
          prompt_image_url?: string | null
          question_id?: string
          question_type?: string | null
          rationale?: Json | null
          text: string
          topic_id: string
          updated_at?: string
          value_tolerance?: number | null
        }
        Update: {
          accepted_answers?: string[] | null
          application_context?: string | null
          article_id?: string | null
          bloom_level?: string | null
          code_citation?: string | null
          correct_option_id?: string
          correct_value?: number | null
          created_at?: string
          difficulty?: number | null
          difficulty_rating?: number | null
          discrimination_rating?: number | null
          explanation?: string | null
          hint_text?: string | null
          irt_calibrated_at?: string | null
          irt_difficulty?: number | null
          irt_discrimination?: number | null
          irt_guessing?: number | null
          is_assessment?: boolean | null
          model_id?: string | null
          normalization_log?: Json | null
          normalization_run_at?: string | null
          normalization_status?: string | null
          options?: Json
          practice_context?: string[] | null
          prompt_image_url?: string | null
          question_id?: string
          question_type?: string | null
          rationale?: Json | null
          text?: string
          topic_id?: string
          updated_at?: string
          value_tolerance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["article_id"]
          },
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
          accuracy_by_block: Json | null
          completed_at: string | null
          config: Json
          current_question_index: number
          discipline_id: string | null
          is_endurance: boolean | null
          is_full_exam: boolean | null
          mastery_snapshot_at_start: Json | null
          pre_session_confidence_ratings: Json | null
          question_ids: string[]
          session_discovery: Json | null
          session_id: string
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          subject_ids: string[]
          test_mode: Database["public"]["Enums"]["test_mode"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_by_block?: Json | null
          completed_at?: string | null
          config?: Json
          current_question_index?: number
          discipline_id?: string | null
          is_endurance?: boolean | null
          is_full_exam?: boolean | null
          mastery_snapshot_at_start?: Json | null
          pre_session_confidence_ratings?: Json | null
          question_ids?: string[]
          session_discovery?: Json | null
          session_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          subject_ids?: string[]
          test_mode?: Database["public"]["Enums"]["test_mode"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_by_block?: Json | null
          completed_at?: string | null
          config?: Json
          current_question_index?: number
          discipline_id?: string | null
          is_endurance?: boolean | null
          is_full_exam?: boolean | null
          mastery_snapshot_at_start?: Json | null
          pre_session_confidence_ratings?: Json | null
          question_ids?: string[]
          session_discovery?: Json | null
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
          analysis_available_at: string | null
          computed_at: string
          is_full_exam: boolean
          score: number
          session_id: string | null
          snapshot_id: string
          sub_scores: Json
          user_id: string
        }
        Insert: {
          analysis_available_at?: string | null
          computed_at?: string
          is_full_exam?: boolean
          score: number
          session_id?: string | null
          snapshot_id?: string
          sub_scores?: Json
          user_id: string
        }
        Update: {
          analysis_available_at?: string | null
          computed_at?: string
          is_full_exam?: boolean
          score?: number
          session_id?: string | null
          snapshot_id?: string
          sub_scores?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "readiness_score_snapshots_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      session_predictions: {
        Row: {
          actual_score: number | null
          created_at: string
          id: string
          postdiction_at: string | null
          postdiction_score: number | null
          prediction_at: string
          prediction_score: number
          session_id: string
          user_id: string
        }
        Insert: {
          actual_score?: number | null
          created_at?: string
          id?: string
          postdiction_at?: string | null
          postdiction_score?: number | null
          prediction_at?: string
          prediction_score: number
          session_id: string
          user_id: string
        }
        Update: {
          actual_score?: number | null
          created_at?: string
          id?: string
          postdiction_at?: string | null
          postdiction_score?: number | null
          prediction_at?: string
          prediction_score?: number
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_predictions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      session_trail_credits: {
        Row: {
          credited_at: string
          enrollment_id: string
          session_id: string
          step_id: string
        }
        Insert: {
          credited_at?: string
          enrollment_id: string
          session_id: string
          step_id: string
        }
        Update: {
          credited_at?: string
          enrollment_id?: string
          session_id?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_trail_credits_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "user_trail_enrollments"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "session_trail_credits_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "session_trail_credits_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "trail_steps"
            referencedColumns: ["step_id"]
          },
        ]
      }
      spatial_hotspots: {
        Row: {
          created_at: string
          description: string | null
          hotspot_id: string
          linked_question_id: string | null
          model_id: string
          node_id: string | null
          phase: string | null
          position_x: number
          position_y: number
          position_z: number
          question_id: string | null
          quiz_trigger_distance: number | null
          reveal_order: number | null
          title: string
          unlock_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hotspot_id?: string
          linked_question_id?: string | null
          model_id: string
          node_id?: string | null
          phase?: string | null
          position_x: number
          position_y: number
          position_z: number
          question_id?: string | null
          quiz_trigger_distance?: number | null
          reveal_order?: number | null
          title: string
          unlock_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hotspot_id?: string
          linked_question_id?: string | null
          model_id?: string
          node_id?: string | null
          phase?: string | null
          position_x?: number
          position_y?: number
          position_z?: number
          question_id?: string | null
          quiz_trigger_distance?: number | null
          reveal_order?: number | null
          title?: string
          unlock_order?: number | null
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
          {
            foreignKeyName: "spatial_hotspots_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
        ]
      }
      study_pods: {
        Row: {
          created_at: string
          created_by: string | null
          invite_code: string | null
          max_members: number
          pod_id: string
          pod_name: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          invite_code?: string | null
          max_members?: number
          pod_id?: string
          pod_name?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          invite_code?: string | null
          max_members?: number
          pod_id?: string
          pod_name?: string | null
        }
        Relationships: []
      }
      successive_relearning_cycles: {
        Row: {
          consecutive_correct: number
          created_at: string
          current_spacing_interval: number | null
          id: string
          next_retest_at: string | null
          spacing_level: number
          status: string
          total_resets: number
          updated_at: string
          user_id: string
        }
        Insert: {
          consecutive_correct?: number
          created_at?: string
          current_spacing_interval?: number | null
          id?: string
          next_retest_at?: string | null
          spacing_level?: number
          status?: string
          total_resets?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          consecutive_correct?: number
          created_at?: string
          current_spacing_interval?: number | null
          id?: string
          next_retest_at?: string | null
          spacing_level?: number
          status?: string
          total_resets?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      taxonomy_cross_references: {
        Row: {
          created_at: string
          id: string
          relationship_type: string
          source_node_id: string
          target_node_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          relationship_type?: string
          source_node_id: string
          target_node_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relationship_type?: string
          source_node_id?: string
          target_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_cross_references_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
          {
            foreignKeyName: "taxonomy_cross_references_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      taxonomy_prerequisites: {
        Row: {
          created_at: string
          id: string
          prerequisite_id: string
          subtopic_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prerequisite_id: string
          subtopic_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prerequisite_id?: string
          subtopic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_prerequisites_prerequisite_id_fkey"
            columns: ["prerequisite_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
          {
            foreignKeyName: "taxonomy_prerequisites_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      taxonomy_sources: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean
          label: string
          node_id: string
          sort_order: number
          source_type: Database["public"]["Enums"]["taxonomy_source_type"]
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean
          label: string
          node_id: string
          sort_order?: number
          source_type?: Database["public"]["Enums"]["taxonomy_source_type"]
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean
          label?: string
          node_id?: string
          sort_order?: number
          source_type?: Database["public"]["Enums"]["taxonomy_source_type"]
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_sources_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      taxonomy_tree: {
        Row: {
          area_weight_pct: number | null
          bloom_level: Database["public"]["Enums"]["bloom_level_type"] | null
          created_at: string
          deprecated_at: string | null
          description: string | null
          difficulty: number | null
          discipline_id: string
          is_computation_heavy: boolean
          is_cross_ref_only: boolean
          is_leaf: boolean
          lea_id: string | null
          level: number
          mastery_criteria: Json | null
          name: string
          node_id: string
          node_type: Database["public"]["Enums"]["taxonomy_node_type"] | null
          parent_id: string | null
          prc_area: string | null
          slug: string | null
          sort_order: number | null
          subject_area: string
          subject_weight_within_area_pct: number | null
          three_d_lab_linked: boolean
          typical_question_formats: string[]
          updated_at: string
          wiki_items: Json
        }
        Insert: {
          area_weight_pct?: number | null
          bloom_level?: Database["public"]["Enums"]["bloom_level_type"] | null
          created_at?: string
          deprecated_at?: string | null
          description?: string | null
          difficulty?: number | null
          discipline_id: string
          is_computation_heavy?: boolean
          is_cross_ref_only?: boolean
          is_leaf?: boolean
          lea_id?: string | null
          level: number
          mastery_criteria?: Json | null
          name: string
          node_id?: string
          node_type?: Database["public"]["Enums"]["taxonomy_node_type"] | null
          parent_id?: string | null
          prc_area?: string | null
          slug?: string | null
          sort_order?: number | null
          subject_area: string
          subject_weight_within_area_pct?: number | null
          three_d_lab_linked?: boolean
          typical_question_formats?: string[]
          updated_at?: string
          wiki_items?: Json
        }
        Update: {
          area_weight_pct?: number | null
          bloom_level?: Database["public"]["Enums"]["bloom_level_type"] | null
          created_at?: string
          deprecated_at?: string | null
          description?: string | null
          difficulty?: number | null
          discipline_id?: string
          is_computation_heavy?: boolean
          is_cross_ref_only?: boolean
          is_leaf?: boolean
          lea_id?: string | null
          level?: number
          mastery_criteria?: Json | null
          name?: string
          node_id?: string
          node_type?: Database["public"]["Enums"]["taxonomy_node_type"] | null
          parent_id?: string | null
          prc_area?: string | null
          slug?: string | null
          sort_order?: number | null
          subject_area?: string
          subject_weight_within_area_pct?: number | null
          three_d_lab_linked?: boolean
          typical_question_formats?: string[]
          updated_at?: string
          wiki_items?: Json
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
      teach_back_submissions: {
        Row: {
          created_at: string | null
          entry_point: string
          evaluation_result: Json | null
          gaps_identified: string[] | null
          prompt_text: string
          revised_at: string | null
          revised_response: string | null
          student_response: string
          submission_id: string
          submitted_at: string | null
          topic_id: string | null
          trail_day_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_point: string
          evaluation_result?: Json | null
          gaps_identified?: string[] | null
          prompt_text: string
          revised_at?: string | null
          revised_response?: string | null
          student_response: string
          submission_id?: string
          submitted_at?: string | null
          topic_id?: string | null
          trail_day_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entry_point?: string
          evaluation_result?: Json | null
          gaps_identified?: string[] | null
          prompt_text?: string
          revised_at?: string | null
          revised_response?: string | null
          student_response?: string
          submission_id?: string
          submitted_at?: string | null
          topic_id?: string | null
          trail_day_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teach_back_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      topic_teach_back_criteria: {
        Row: {
          authored_by: string | null
          code_citations: string[] | null
          common_misconceptions: string[] | null
          created_at: string | null
          criteria_id: string
          required_concepts: string[]
          required_exceptions: string[]
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          authored_by?: string | null
          code_citations?: string[] | null
          common_misconceptions?: string[] | null
          created_at?: string | null
          criteria_id?: string
          required_concepts?: string[]
          required_exceptions?: string[]
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          authored_by?: string | null
          code_citations?: string[] | null
          common_misconceptions?: string[] | null
          created_at?: string | null
          criteria_id?: string
          required_concepts?: string[]
          required_exceptions?: string[]
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_teach_back_criteria_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      trail_day_completions: {
        Row: {
          all_steps_completed: boolean
          completed_at: string
          day_completion_id: string
          day_id: string
          day_number: number | null
          enrollment_id: string
          mastery_after: Json | null
          mastery_before: Json | null
          readiness_score_at_completion: number | null
          user_id: string
        }
        Insert: {
          all_steps_completed?: boolean
          completed_at?: string
          day_completion_id?: string
          day_id: string
          day_number?: number | null
          enrollment_id: string
          mastery_after?: Json | null
          mastery_before?: Json | null
          readiness_score_at_completion?: number | null
          user_id: string
        }
        Update: {
          all_steps_completed?: boolean
          completed_at?: string
          day_completion_id?: string
          day_id?: string
          day_number?: number | null
          enrollment_id?: string
          mastery_after?: Json | null
          mastery_before?: Json | null
          readiness_score_at_completion?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_day_completions_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "trail_days"
            referencedColumns: ["day_id"]
          },
          {
            foreignKeyName: "trail_day_completions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "user_trail_enrollments"
            referencedColumns: ["enrollment_id"]
          },
        ]
      }
      trail_days: {
        Row: {
          created_at: string
          day_id: string
          day_number: number
          description: string | null
          estimated_minutes: number | null
          is_phase_transition: boolean
          is_rest_day: boolean
          phase_name: string | null
          subject_color: string | null
          subject_focus: string | null
          title: string
          trail_id: string
        }
        Insert: {
          created_at?: string
          day_id?: string
          day_number: number
          description?: string | null
          estimated_minutes?: number | null
          is_phase_transition?: boolean
          is_rest_day?: boolean
          phase_name?: string | null
          subject_color?: string | null
          subject_focus?: string | null
          title: string
          trail_id: string
        }
        Update: {
          created_at?: string
          day_id?: string
          day_number?: number
          description?: string | null
          estimated_minutes?: number | null
          is_phase_transition?: boolean
          is_rest_day?: boolean
          phase_name?: string | null
          subject_color?: string | null
          subject_focus?: string | null
          title?: string
          trail_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_days_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "camp_trails"
            referencedColumns: ["trail_id"]
          },
        ]
      }
      trail_steps: {
        Row: {
          article_id: string | null
          created_at: string
          day_id: string
          description: string | null
          difficulty_max: number | null
          difficulty_min: number | null
          estimated_minutes: number | null
          is_computation_heavy: boolean
          is_optional: boolean
          lab_phase: string | null
          model_id: string | null
          preferred_time: string | null
          question_count: number | null
          step_id: string
          step_order: number
          step_type: Database["public"]["Enums"]["trail_step_type"]
          target_node_ids: string[] | null
          title: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          day_id: string
          description?: string | null
          difficulty_max?: number | null
          difficulty_min?: number | null
          estimated_minutes?: number | null
          is_computation_heavy?: boolean
          is_optional?: boolean
          lab_phase?: string | null
          model_id?: string | null
          preferred_time?: string | null
          question_count?: number | null
          step_id?: string
          step_order: number
          step_type: Database["public"]["Enums"]["trail_step_type"]
          target_node_ids?: string[] | null
          title: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          day_id?: string
          description?: string | null
          difficulty_max?: number | null
          difficulty_min?: number | null
          estimated_minutes?: number | null
          is_computation_heavy?: boolean
          is_optional?: boolean
          lab_phase?: string | null
          model_id?: string | null
          preferred_time?: string | null
          question_count?: number | null
          step_id?: string
          step_order?: number
          step_type?: Database["public"]["Enums"]["trail_step_type"]
          target_node_ids?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_steps_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["article_id"]
          },
          {
            foreignKeyName: "trail_steps_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "trail_days"
            referencedColumns: ["day_id"]
          },
          {
            foreignKeyName: "trail_steps_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models_3d"
            referencedColumns: ["model_id"]
          },
        ]
      }
      user_computed_signals: {
        Row: {
          calibration_accuracy: number | null
          calibration_score: number | null
          calibration_sessions_count: number
          calibration_updated_at: string | null
          churn_risk_score: number
          churn_risk_updated_at: string | null
          computed_at: string
          days_since_last_session: number | null
          endurance_baseline_items: number | null
          endurance_last_updated: string | null
          endurance_target_items: number | null
          endurance_window_items: number | null
          score_velocity_7d: number
          score_velocity_updated_at: string | null
          sessions_last_7d: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calibration_accuracy?: number | null
          calibration_score?: number | null
          calibration_sessions_count?: number
          calibration_updated_at?: string | null
          churn_risk_score?: number
          churn_risk_updated_at?: string | null
          computed_at?: string
          days_since_last_session?: number | null
          endurance_baseline_items?: number | null
          endurance_last_updated?: string | null
          endurance_target_items?: number | null
          endurance_window_items?: number | null
          score_velocity_7d?: number
          score_velocity_updated_at?: string | null
          sessions_last_7d?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calibration_accuracy?: number | null
          calibration_score?: number | null
          calibration_sessions_count?: number
          calibration_updated_at?: string | null
          churn_risk_score?: number
          churn_risk_updated_at?: string | null
          computed_at?: string
          days_since_last_session?: number | null
          endurance_baseline_items?: number | null
          endurance_last_updated?: string | null
          endurance_target_items?: number | null
          endurance_window_items?: number | null
          score_velocity_7d?: number
          score_velocity_updated_at?: string | null
          sessions_last_7d?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_endurance_profiles: {
        Row: {
          avg_seconds_per_question: number | null
          baseline_accuracy_decay_at: number | null
          baseline_avg_accuracy: number | null
          baseline_calibrated_at: string | null
          baseline_reliable_items: number | null
          computed_at: string
          consecutive_plateau_weeks: number
          current_endurance_target: number | null
          endurance_gate_pct: number | null
          endurance_sessions_completed: number
          endurance_window_minutes: number | null
          last_endurance_session_at: string | null
          pacing_target_seconds: number
          pacing_updated_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_seconds_per_question?: number | null
          baseline_accuracy_decay_at?: number | null
          baseline_avg_accuracy?: number | null
          baseline_calibrated_at?: string | null
          baseline_reliable_items?: number | null
          computed_at?: string
          consecutive_plateau_weeks?: number
          current_endurance_target?: number | null
          endurance_gate_pct?: number | null
          endurance_sessions_completed?: number
          endurance_window_minutes?: number | null
          last_endurance_session_at?: string | null
          pacing_target_seconds?: number
          pacing_updated_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_seconds_per_question?: number | null
          baseline_accuracy_decay_at?: number | null
          baseline_avg_accuracy?: number | null
          baseline_calibrated_at?: string | null
          baseline_reliable_items?: number | null
          computed_at?: string
          consecutive_plateau_weeks?: number
          current_endurance_target?: number | null
          endurance_gate_pct?: number | null
          endurance_sessions_completed?: number
          endurance_window_minutes?: number | null
          last_endurance_session_at?: string | null
          pacing_target_seconds?: number
          pacing_updated_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_global_stats: {
        Row: {
          acquisition_touchpoints: Json | null
          assessment_completed_at: string | null
          assessment_score: number | null
          assessment_started_at: string | null
          best_simulation_score: number | null
          churn_risk_score: number | null
          churn_risk_updated_at: string | null
          current_discipline_id: string | null
          customer_archetype: string | null
          exam_attempt_number: number | null
          final_stretch_upsell_shown: boolean | null
          first_session_at: string | null
          first_touch_campaign: string | null
          first_touch_source: string | null
          free_questions_reset_date: string | null
          free_questions_today: number | null
          global_current_streak: number
          global_longest_streak: number
          global_readiness_score: number
          is_retaker: boolean
          last_active_date: string | null
          last_simulation_score: number | null
          last_study_date: string | null
          last_touch_campaign: string | null
          last_touch_source: string | null
          onboarding_completed_at: string | null
          onboarding_retaker_framing_shown: boolean
          previous_exam_result: string | null
          full_exam_unlocked_at: string | null
          readiness_sub_scores: Json
          referral_code: string | null
          score_reveal_shown_at: string | null
          score_velocity_7d: number | null
          score_velocity_updated_at: string | null
          signup_source: string | null
          simulation_count: number | null
          target_exam_date: string | null
          updated_at: string
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
        }
        Insert: {
          acquisition_touchpoints?: Json | null
          assessment_completed_at?: string | null
          assessment_score?: number | null
          assessment_started_at?: string | null
          best_simulation_score?: number | null
          churn_risk_score?: number | null
          churn_risk_updated_at?: string | null
          current_discipline_id?: string | null
          customer_archetype?: string | null
          exam_attempt_number?: number | null
          final_stretch_upsell_shown?: boolean | null
          first_session_at?: string | null
          first_touch_campaign?: string | null
          first_touch_source?: string | null
          free_questions_reset_date?: string | null
          free_questions_today?: number | null
          global_current_streak?: number
          global_longest_streak?: number
          global_readiness_score?: number
          is_retaker?: boolean
          last_active_date?: string | null
          last_simulation_score?: number | null
          last_study_date?: string | null
          last_touch_campaign?: string | null
          last_touch_source?: string | null
          onboarding_completed_at?: string | null
          onboarding_retaker_framing_shown?: boolean
          previous_exam_result?: string | null
          full_exam_unlocked_at?: string | null
          readiness_sub_scores?: Json
          referral_code?: string | null
          score_reveal_shown_at?: string | null
          score_velocity_7d?: number | null
          score_velocity_updated_at?: string | null
          signup_source?: string | null
          simulation_count?: number | null
          target_exam_date?: string | null
          updated_at?: string
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
        }
        Update: {
          acquisition_touchpoints?: Json | null
          assessment_completed_at?: string | null
          assessment_score?: number | null
          assessment_started_at?: string | null
          best_simulation_score?: number | null
          churn_risk_score?: number | null
          churn_risk_updated_at?: string | null
          current_discipline_id?: string | null
          customer_archetype?: string | null
          exam_attempt_number?: number | null
          final_stretch_upsell_shown?: boolean | null
          first_session_at?: string | null
          first_touch_campaign?: string | null
          first_touch_source?: string | null
          free_questions_reset_date?: string | null
          free_questions_today?: number | null
          global_current_streak?: number
          global_longest_streak?: number
          global_readiness_score?: number
          is_retaker?: boolean
          last_active_date?: string | null
          last_simulation_score?: number | null
          last_study_date?: string | null
          last_touch_campaign?: string | null
          last_touch_source?: string | null
          onboarding_completed_at?: string | null
          onboarding_retaker_framing_shown?: boolean
          previous_exam_result?: string | null
          full_exam_unlocked_at?: string | null
          readiness_sub_scores?: Json
          referral_code?: string | null
          score_reveal_shown_at?: string | null
          score_velocity_7d?: number | null
          score_velocity_updated_at?: string | null
          signup_source?: string | null
          simulation_count?: number | null
          target_exam_date?: string | null
          updated_at?: string
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
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
          answer_changes: number
          confidence: string | null
          created_at: string
          error_category: string | null
          error_confidence: number | null
          error_type: string | null
          interaction_id: string
          interaction_timestamp: string
          is_correct: boolean
          is_flagged: boolean
          is_suspected_lucky_guess: boolean
          options_eliminated: number
          question_id: string
          question_order: number | null
          rationale_view_ms: number | null
          selected_option_id: string | null
          session_id: string
          source_type: string | null
          time_spent_ms: number | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answer_changes?: number
          confidence?: string | null
          created_at?: string
          error_category?: string | null
          error_confidence?: number | null
          error_type?: string | null
          interaction_id?: string
          interaction_timestamp?: string
          is_correct: boolean
          is_flagged?: boolean
          is_suspected_lucky_guess?: boolean
          options_eliminated?: number
          question_id: string
          question_order?: number | null
          rationale_view_ms?: number | null
          selected_option_id?: string | null
          session_id: string
          source_type?: string | null
          time_spent_ms?: number | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answer_changes?: number
          confidence?: string | null
          created_at?: string
          error_category?: string | null
          error_confidence?: number | null
          error_type?: string | null
          interaction_id?: string
          interaction_timestamp?: string
          is_correct?: boolean
          is_flagged?: boolean
          is_suspected_lucky_guess?: boolean
          options_eliminated?: number
          question_id: string
          question_order?: number | null
          rationale_view_ms?: number | null
          selected_option_id?: string | null
          session_id: string
          source_type?: string | null
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
      user_mastery_history: {
        Row: {
          created_at: string | null
          id: string
          mastery_weight: number
          session_id: string | null
          snapshot_reason: string | null
          total_attempts: number
          total_correct: number
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mastery_weight: number
          session_id?: string | null
          snapshot_reason?: string | null
          total_attempts?: number
          total_correct?: number
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mastery_weight?: number
          session_id?: string | null
          snapshot_reason?: string | null
          total_attempts?: number
          total_correct?: number
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mastery_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "user_mastery_history_topic_id_fkey"
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
          consecutive_correct_streak: number
          current_mastery_weight: number
          decay_rate: number | null
          distinct_questions_seen: number
          ease_factor: number | null
          has_bloom_analyze_correct: boolean
          has_bloom_apply_correct: boolean
          highest_difficulty_correct: number
          last_encountered: string
          next_review_at: string | null
          optimal_review_at: string | null
          practice_contexts: number | null
          practice_count: number | null
          predicted_recall: number | null
          retrieval_strength: number | null
          review_count: number
          review_interval_days: number | null
          storage_strength: number | null
          teach_back_attempted: boolean | null
          teach_back_gap_count: number | null
          total_attempts: number
          total_correct: number
          topic_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_time_ms?: number
          consecutive_correct_streak?: number
          current_mastery_weight?: number
          decay_rate?: number | null
          distinct_questions_seen?: number
          ease_factor?: number | null
          has_bloom_analyze_correct?: boolean
          has_bloom_apply_correct?: boolean
          highest_difficulty_correct?: number
          last_encountered?: string
          next_review_at?: string | null
          optimal_review_at?: string | null
          practice_contexts?: number | null
          practice_count?: number | null
          predicted_recall?: number | null
          retrieval_strength?: number | null
          review_count?: number
          review_interval_days?: number | null
          storage_strength?: number | null
          teach_back_attempted?: boolean | null
          teach_back_gap_count?: number | null
          total_attempts?: number
          total_correct?: number
          topic_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_time_ms?: number
          consecutive_correct_streak?: number
          current_mastery_weight?: number
          decay_rate?: number | null
          distinct_questions_seen?: number
          ease_factor?: number | null
          has_bloom_analyze_correct?: boolean
          has_bloom_apply_correct?: boolean
          highest_difficulty_correct?: number
          last_encountered?: string
          next_review_at?: string | null
          optimal_review_at?: string | null
          practice_contexts?: number | null
          practice_count?: number | null
          predicted_recall?: number | null
          retrieval_strength?: number | null
          review_count?: number
          review_interval_days?: number | null
          storage_strength?: number | null
          teach_back_attempted?: boolean | null
          teach_back_gap_count?: number | null
          total_attempts?: number
          total_correct?: number
          topic_id?: string
          updated_at?: string | null
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
      user_push_tokens: {
        Row: {
          created_at: string
          is_active: boolean
          platform: string
          token: string
          token_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_active?: boolean
          platform: string
          token: string
          token_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_active?: boolean
          platform?: string
          token?: string
          token_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_question_responses: {
        Row: {
          answered_at: string
          confidence_level: number | null
          is_correct: boolean
          question_id: string
          response_id: string
          selected_option: string | null
          session_id: string | null
          time_taken_ms: number | null
          user_id: string
        }
        Insert: {
          answered_at?: string
          confidence_level?: number | null
          is_correct: boolean
          question_id: string
          response_id?: string
          selected_option?: string | null
          session_id?: string | null
          time_taken_ms?: number | null
          user_id: string
        }
        Update: {
          answered_at?: string
          confidence_level?: number | null
          is_correct?: boolean
          question_id?: string
          response_id?: string
          selected_option?: string | null
          session_id?: string | null
          time_taken_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "user_question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "user_question_stats"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "user_question_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      user_question_states: {
        Row: {
          avg_time_ms: number
          last_is_correct: boolean
          last_seen_at: string
          question_id: string
          total_attempts: number
          total_time_ms: number
          user_id: string
        }
        Insert: {
          avg_time_ms?: number
          last_is_correct: boolean
          last_seen_at?: string
          question_id: string
          total_attempts?: number
          total_time_ms?: number
          user_id: string
        }
        Update: {
          avg_time_ms?: number
          last_is_correct?: boolean
          last_seen_at?: string
          question_id?: string
          total_attempts?: number
          total_time_ms?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_states_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "user_question_states_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "user_question_stats"
            referencedColumns: ["question_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_srs_cards: {
        Row: {
          created_at: string
          ease_factor: number
          id: string
          interval_days: number
          last_reviewed_at: string | null
          next_review_at: string
          node_id: string
          quality_last: number | null
          repetitions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          node_id: string
          quality_last?: number | null
          repetitions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          node_id?: string
          quality_last?: number | null
          repetitions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount: number | null
          cancelled_at: string | null
          converted_from_source: string | null
          created_at: string
          email_notifications_enabled: boolean | null
          free_cap_reset_date: string | null
          free_questions_today: number
          lemonsqueezy_customer_id: string | null
          lemonsqueezy_subscription_id: string | null
          marketing_emails_enabled: boolean | null
          payrex_customer_id: string | null
          payrex_reference: string | null
          readiness_score_at_conversion: number | null
          status: Database["public"]["Enums"]["subscription_status"]
          subscription_id: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          trial_started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          cancelled_at?: string | null
          converted_from_source?: string | null
          created_at?: string
          email_notifications_enabled?: boolean | null
          free_cap_reset_date?: string | null
          free_questions_today?: number
          lemonsqueezy_customer_id?: string | null
          lemonsqueezy_subscription_id?: string | null
          marketing_emails_enabled?: boolean | null
          payrex_customer_id?: string | null
          payrex_reference?: string | null
          readiness_score_at_conversion?: number | null
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_id?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          cancelled_at?: string | null
          converted_from_source?: string | null
          created_at?: string
          email_notifications_enabled?: boolean | null
          free_cap_reset_date?: string | null
          free_questions_today?: number
          lemonsqueezy_customer_id?: string | null
          lemonsqueezy_subscription_id?: string | null
          marketing_emails_enabled?: boolean | null
          payrex_customer_id?: string | null
          payrex_reference?: string | null
          readiness_score_at_conversion?: number | null
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_id?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_theta: {
        Row: {
          created_at: string
          discipline_id: string | null
          id: string
          responses_count: number
          theta: number
          theta_se: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discipline_id?: string | null
          id?: string
          responses_count?: number
          theta?: number
          theta_se?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discipline_id?: string | null
          id?: string
          responses_count?: number
          theta?: number
          theta_se?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_theta_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["discipline_id"]
          },
        ]
      }
      user_trail_enrollments: {
        Row: {
          abandoned_at: string | null
          completed_at: string | null
          created_at: string
          current_day: number
          current_streak: number
          days_completed: number
          days_completed_at_abandon: number | null
          enrollment_id: string
          grace_days_used_this_week: number
          last_activity_at: string | null
          last_streak_date: string | null
          longest_streak: number
          milestones_shown: Json
          pace_status: string | null
          paused_at: string | null
          readiness_score_at_start: number | null
          started_at: string
          status: Database["public"]["Enums"]["trail_enrollment_status"]
          streak_grace_week_start: string | null
          target_completion_date: string | null
          trail_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          abandoned_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_day?: number
          current_streak?: number
          days_completed?: number
          days_completed_at_abandon?: number | null
          enrollment_id?: string
          grace_days_used_this_week?: number
          last_activity_at?: string | null
          last_streak_date?: string | null
          longest_streak?: number
          milestones_shown?: Json
          pace_status?: string | null
          paused_at?: string | null
          readiness_score_at_start?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["trail_enrollment_status"]
          streak_grace_week_start?: string | null
          target_completion_date?: string | null
          trail_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          abandoned_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_day?: number
          current_streak?: number
          days_completed?: number
          days_completed_at_abandon?: number | null
          enrollment_id?: string
          grace_days_used_this_week?: number
          last_activity_at?: string | null
          last_streak_date?: string | null
          longest_streak?: number
          milestones_shown?: Json
          pace_status?: string | null
          paused_at?: string | null
          readiness_score_at_start?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["trail_enrollment_status"]
          streak_grace_week_start?: string | null
          target_completion_date?: string | null
          trail_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trail_enrollments_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "camp_trails"
            referencedColumns: ["trail_id"]
          },
        ]
      }
      user_trail_progress: {
        Row: {
          completed_at: string
          enrollment_id: string
          progress_id: string
          session_id: string | null
          step_id: string
          time_spent_ms: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          enrollment_id: string
          progress_id?: string
          session_id?: string | null
          step_id: string
          time_spent_ms?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          enrollment_id?: string
          progress_id?: string
          session_id?: string | null
          step_id?: string
          time_spent_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trail_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "user_trail_enrollments"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "user_trail_progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "user_trail_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "trail_steps"
            referencedColumns: ["step_id"]
          },
        ]
      }
      wiki_article_reads: {
        Row: {
          article_id: string
          read_at: string
          read_id: string
          read_pct: number
          time_spent_ms: number | null
          trail_step_id: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          read_at?: string
          read_id?: string
          read_pct?: number
          time_spent_ms?: number | null
          trail_step_id?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          read_at?: string
          read_id?: string
          read_pct?: number
          time_spent_ms?: number | null
          trail_step_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_article_reads_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["article_id"]
          },
          {
            foreignKeyName: "wiki_article_reads_trail_step_id_fkey"
            columns: ["trail_step_id"]
            isOneToOne: false
            referencedRelation: "trail_steps"
            referencedColumns: ["step_id"]
          },
        ]
      }
      wiki_article_sources: {
        Row: {
          article_id: string
          created_at: string
          description: string | null
          is_verified: boolean
          label: string
          sort_order: number
          source_id: string
          source_type: Database["public"]["Enums"]["taxonomy_source_type"]
          updated_at: string
          url: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          description?: string | null
          is_verified?: boolean
          label: string
          sort_order?: number
          source_type: Database["public"]["Enums"]["taxonomy_source_type"]
          updated_at?: string
          url?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          description?: string | null
          is_verified?: boolean
          label?: string
          sort_order?: number
          source_type?: Database["public"]["Enums"]["taxonomy_source_type"]
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_article_sources_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["article_id"]
          },
        ]
      }
      wiki_article_taxonomy: {
        Row: {
          article_id: string
          is_primary: boolean | null
          node_id: string
          sort_order: number
        }
        Insert: {
          article_id: string
          is_primary?: boolean | null
          node_id: string
          sort_order?: number
        }
        Update: {
          article_id?: string
          is_primary?: boolean | null
          node_id?: string
          sort_order?: number
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
          created_by: string | null
          difficulty_label: string | null
          fts: unknown
          lea_tests_you: string | null
          read_time: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_comments: string | null
          slug: string
          status: string | null
          subject_label: string | null
          title: string
          updated_at: string
          updated_by: string | null
          updated_note: string | null
        }
        Insert: {
          article_id?: string
          content: string
          created_at?: string
          created_by?: string | null
          difficulty_label?: string | null
          fts?: unknown
          lea_tests_you?: string | null
          read_time?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_comments?: string | null
          slug: string
          status?: string | null
          subject_label?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          updated_note?: string | null
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          difficulty_label?: string | null
          fts?: unknown
          lea_tests_you?: string | null
          read_time?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_comments?: string | null
          slug?: string
          status?: string | null
          subject_label?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          updated_note?: string | null
        }
        Relationships: []
      }
      wiki_bookmarks: {
        Row: {
          article_id: string
          bookmark_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          bookmark_id?: string
          created_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          bookmark_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["article_id"]
          },
        ]
      }
      wiki_ei_prompts: {
        Row: {
          article_id: string
          created_at: string
          insert_after_heading: string
          is_active: boolean
          node_id: string | null
          options: Json | null
          prompt_id: string
          prompt_text: string
          reveal_text: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          article_id: string
          created_at?: string
          insert_after_heading: string
          is_active?: boolean
          node_id?: string | null
          options?: Json | null
          prompt_id?: string
          prompt_text: string
          reveal_text: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          created_at?: string
          insert_after_heading?: string
          is_active?: boolean
          node_id?: string | null
          options?: Json | null
          prompt_id?: string
          prompt_text?: string
          reveal_text?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_ei_prompts_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["article_id"]
          },
          {
            foreignKeyName: "wiki_ei_prompts_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
        ]
      }
      wiki_ei_responses: {
        Row: {
          prompt_id: string
          responded_at: string
          response_id: string
          response_text: string | null
          selected_option_index: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          prompt_id: string
          responded_at?: string
          response_id?: string
          response_text?: string | null
          selected_option_index?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          prompt_id?: string
          responded_at?: string
          response_id?: string
          response_text?: string | null
          selected_option_index?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_ei_responses_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "wiki_ei_prompts"
            referencedColumns: ["prompt_id"]
          },
        ]
      }
      wiki_highlights: {
        Row: {
          article_id: string
          color: string | null
          created_at: string
          highlight_text: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          color?: string | null
          created_at?: string
          highlight_text: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          color?: string | null
          created_at?: string
          highlight_text?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_highlights_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["article_id"]
          },
          {
            foreignKeyName: "wiki_highlights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_highlights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_capabilities"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      mv_acquisition_source_distribution: {
        Row: {
          avg_days_to_conversion: number | null
          conversion_rate: number | null
          converted_users: number | null
          source: string | null
          total_users: number | null
        }
        Relationships: []
      }
      mv_churn_risk_distribution: {
        Row: {
          avg_days_since_session: number | null
          avg_readiness_score: number | null
          avg_score_velocity: number | null
          risk_level: string | null
          user_count: number | null
        }
        Relationships: []
      }
      mv_churn_signals: {
        Row: {
          affected_users: number | null
          churn_multiplier: number | null
          signal_description: string | null
          signal_key: string | null
        }
        Relationships: []
      }
      mv_cohort_retention: {
        Row: {
          active_users: number | null
          cohort_month: string | null
          cohort_size: number | null
          retention_rate: number | null
          week_number: number | null
        }
        Relationships: []
      }
      mv_engagement_snapshot: {
        Row: {
          avg_sessions_per_week: number | null
          avg_streak_length: number | null
          dau: number | null
          dau_mau_ratio: number | null
          mau: number | null
          snapshot_date: string | null
          wau: number | null
        }
        Relationships: []
      }
      mv_monthly_financial_summary: {
        Row: {
          category: string | null
          entry_count: number | null
          entry_type: string | null
          has_recurring: boolean | null
          month: string | null
          total_amount: number | null
        }
        Relationships: []
      }
      mv_time_to_value: {
        Row: {
          avg_score_at_conversion: number | null
          avg_sessions_before_conversion: number | null
          computed_at: string | null
          diagnostic_completion_rate: number | null
          free_to_paid_conversion_rate: number | null
          median_days_to_conversion: number | null
          median_days_to_first_session: number | null
        }
        Relationships: []
      }
      user_capabilities: {
        Row: {
          email: string | null
          subscription_status: string | null
          subscription_tier: string | null
          user_id: string | null
          user_role: string | null
        }
        Relationships: []
      }
      user_question_stats: {
        Row: {
          avg_time_ms: number | null
          correct_count: number | null
          first_answered_at: string | null
          last_answered_at: string | null
          last_was_correct: boolean | null
          question_id: string | null
          total_attempts: number | null
          user_id: string | null
          wrong_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
        ]
      }
      v_current_gate: {
        Row: {
          created_at: string | null
          created_by: string | null
          entered_at: string | null
          exit_conditions_met: Json | null
          gate_number: number | null
          id: string | null
          notes: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_review_content: { Args: never; Returns: boolean }
      check_user_admin_role: { Args: { p_user_id: string }; Returns: boolean }
      compute_monthly_burn: { Args: { target_month?: string }; Returns: number }
      compute_monthly_churn_rate: { Args: never; Returns: number }
      compute_mrr: { Args: never; Returns: number }
      compute_runway_months: { Args: never; Returns: number }
      create_notification: {
        Args: {
          p_body: string
          p_metadata?: Json
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      detect_confusion_pairs: {
        Args: never
        Returns: {
          co_failure_rate: number
          sample_size: number
          topic_a: string
          topic_b: string
        }[]
      }
      fetch_normalization_batch: {
        Args: { p_batch_size?: number }
        Returns: {
          correct_option_id: string
          explanation: string
          options: Json
          question_id: string
          text: string
        }[]
      }
      get_article_with_node: { Args: { p_slug: string }; Returns: Json }
      get_fallback_questions: {
        Args: {
          p_exclude_ids: string[]
          p_limit?: number
          p_topic_ids: string[]
        }
        Returns: {
          difficulty: number
          metadata: Json
          options: Json
          prompt_image_url: string
          question_id: string
          question_type: string
          text: string
          topic_id: string
        }[]
      }
      get_quiz_session_interaction_stats: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: {
          answered_count: number
          correct_count: number
        }[]
      }
      get_review_deck: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          ease_factor: number
          id: string
          interval_days: number
          last_reviewed_at: string
          next_review_at: string
          node_id: string
          overdue_days: number
          quality_last: number
          repetitions: number
        }[]
      }
      get_review_due_count: { Args: { p_user_id: string }; Returns: number }
      get_unseen_questions: {
        Args: {
          p_difficulty_max?: number
          p_difficulty_min?: number
          p_limit?: number
          p_topic_ids: string[]
          p_user_id: string
        }
        Returns: {
          difficulty: number
          metadata: Json
          options: Json
          prompt_image_url: string
          question_id: string
          question_type: string
          text: string
          topic_id: string
        }[]
      }
      has_admin_role: { Args: never; Returns: boolean }
      is_ceo_or_super_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      refresh_ceo_materialized_views: { Args: never; Returns: undefined }
      refresh_user_question_states: { Args: never; Returns: undefined }
      search_wiki_articles_hybrid: {
        Args: {
          fts_weight?: number
          match_count?: number
          query_embedding: string
          query_text: string
          semantic_weight?: number
        }
        Returns: {
          article_id: string
          rank: number
          slug: string
          snippet: string
          title: string
        }[]
      }
      search_wiki_articles_pure: {
        Args: { match_count?: number; query_text: string }
        Returns: {
          article_id: string
          rank: number
          slug: string
          snippet: string
          title: string
        }[]
      }
      select_next_item: {
        Args: {
          p_discipline_id: string
          p_session_id: string
          p_target_p?: number
          p_topic_id?: string
          p_user_id: string
        }
        Returns: {
          fisher_information: number
          irt_difficulty: number
          irt_discrimination: number
          irt_guessing: number
          question_id: string
        }[]
      }
      select_prequestions: {
        Args: { p_count?: number; p_topic_id: string; p_user_id: string }
        Returns: {
          accepted_answers: string[] | null
          application_context: string | null
          article_id: string | null
          bloom_level: string | null
          code_citation: string | null
          correct_option_id: string
          correct_value: number | null
          created_at: string
          created_by: string | null
          difficulty: number | null
          difficulty_rating: number | null
          discrimination_rating: number | null
          explanation: string | null
          hint_text: string | null
          irt_calibrated_at: string | null
          irt_difficulty: number | null
          irt_discrimination: number | null
          irt_guessing: number | null
          is_assessment: boolean | null
          model_id: string | null
          normalization_log: Json | null
          normalization_run_at: string | null
          normalization_status: string | null
          options: Json
          practice_context: string[] | null
          prompt_image_url: string | null
          question_id: string
          question_type: string | null
          rationale: Json | null
          text: string
          topic_id: string
          updated_at: string
          updated_by: string | null
          value_tolerance: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "questions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      submit_quiz_answer_v2: {
        Args: {
          p_confidence: string
          p_confidence_score: number
          p_is_correct: boolean
          p_is_suspected_lucky_guess: boolean
          p_question_id: string
          p_question_order: number
          p_selected_option_id: string
          p_session_id: string
          p_time_spent_ms: number
          p_user_id: string
        }
        Returns: {
          answered_count: number
          correct_count: number
          interaction_id: string
          rationale: Json
          topic_id: string
          wiki_slug: string
        }[]
      }
      update_theta: {
        Args: {
          p_discipline_id: string
          p_is_correct: boolean
          p_item_difficulty: number
          p_item_discrimination: number
          p_user_id: string
        }
        Returns: {
          responses_count: number
          theta: number
          theta_se: number
        }[]
      }
    }
    Enums: {
      bloom_level_type: "remember" | "understand" | "apply" | "analyze"
      design_occupancy_category:
        | "residential"
        | "commercial"
        | "institutional"
        | "industrial"
        | "mixed_use"
        | "special"
      design_question_type:
        | "DC"
        | "SP"
        | "ZN"
        | "BD"
        | "ES"
        | "AI"
        | "PK"
        | "SC"
        | "BP344"
      exam_frequency_level: "low" | "medium" | "high"
      financial_entry_type: "revenue" | "expense" | "investment"
      notification_type:
        | "score_change"
        | "trail_ready"
        | "focus_review"
        | "zone_transition"
        | "proof_unlocked"
        | "campfire_story"
        | "campfire_reply"
        | "content_update"
        | "weekly_digest"
        | "coaching_tip"
        | "billing"
        | "system"
      session_status: "in_progress" | "completed" | "abandoned"
      subscription_status: "active" | "cancelled" | "expired" | "trialing"
      subscription_tier:
        | "free"
        | "pro"
        | "prime"
        | "institutional"
        | "enterprise"
      system_role_type:
        | "ceo"
        | "super_admin"
        | "admin"
        | "lead"
        | "member"
        | "consultant"
        | "viewer"
      taxonomy_node_type:
        | "concept"
        | "code_provision"
        | "formula"
        | "case_study"
        | "person"
        | "building"
        | "fact"
        | "professional_standard"
        | "service_delivery_method"
      taxonomy_source_type:
        | "primary_law"
        | "implementing_rules"
        | "regulatory_body"
        | "reference_standard"
        | "prc_syllabus"
        | "heritage_body"
      team_department:
        | "engineering"
        | "content"
        | "design"
        | "marketing"
        | "operations"
        | "consulting"
      test_mode:
        | "camp"
        | "timed"
        | "practice"
        | "storm"
        | "chill"
        | "custom"
        | "focus_review"
        | "full_exam"
        | "endurance"
      trail_enrollment_status: "active" | "paused" | "completed" | "abandoned"
      trail_intensity:
        | "intensive"
        | "accelerated"
        | "standard"
        | "comprehensive"
        | "undergraduate"
      trail_step_type: "quiz" | "wiki" | "lab" | "review"
      trail_type:
        | "time_gated"
        | "subject_mastery"
        | "code_deep_dive"
        | "remediation"
        | "exam_simulation"
      user_type: "regular" | "educational" | "corporate"
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
      bloom_level_type: ["remember", "understand", "apply", "analyze"],
      design_occupancy_category: [
        "residential",
        "commercial",
        "institutional",
        "industrial",
        "mixed_use",
        "special",
      ],
      design_question_type: [
        "DC",
        "SP",
        "ZN",
        "BD",
        "ES",
        "AI",
        "PK",
        "SC",
        "BP344",
      ],
      exam_frequency_level: ["low", "medium", "high"],
      financial_entry_type: ["revenue", "expense", "investment"],
      notification_type: [
        "score_change",
        "trail_ready",
        "focus_review",
        "zone_transition",
        "proof_unlocked",
        "campfire_story",
        "campfire_reply",
        "content_update",
        "weekly_digest",
        "coaching_tip",
        "billing",
        "system",
      ],
      session_status: ["in_progress", "completed", "abandoned"],
      subscription_status: ["active", "cancelled", "expired", "trialing"],
      subscription_tier: [
        "free",
        "pro",
        "prime",
        "institutional",
        "enterprise",
      ],
      system_role_type: [
        "ceo",
        "super_admin",
        "admin",
        "lead",
        "member",
        "consultant",
        "viewer",
      ],
      taxonomy_node_type: [
        "concept",
        "code_provision",
        "formula",
        "case_study",
        "person",
        "building",
        "fact",
        "professional_standard",
        "service_delivery_method",
      ],
      taxonomy_source_type: [
        "primary_law",
        "implementing_rules",
        "regulatory_body",
        "reference_standard",
        "prc_syllabus",
        "heritage_body",
      ],
      team_department: [
        "engineering",
        "content",
        "design",
        "marketing",
        "operations",
        "consulting",
      ],
      test_mode: [
        "camp",
        "timed",
        "practice",
        "storm",
        "chill",
        "custom",
        "focus_review",
        "full_exam",
        "endurance",
      ],
      trail_enrollment_status: ["active", "paused", "completed", "abandoned"],
      trail_intensity: [
        "intensive",
        "accelerated",
        "standard",
        "comprehensive",
        "undergraduate",
      ],
      trail_step_type: ["quiz", "wiki", "lab", "review"],
      trail_type: [
        "time_gated",
        "subject_mastery",
        "code_deep_dive",
        "remediation",
        "exam_simulation",
      ],
      user_type: ["regular", "educational", "corporate"],
    },
  },
} as const
