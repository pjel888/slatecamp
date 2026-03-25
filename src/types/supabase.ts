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
      blindspot_queues: {
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
          session_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      camp_trails: {
        Row: {
          created_at: string
          description: string | null
          discipline_id: string
          duration_days: number
          intensity: Database["public"]["Enums"]["trail_intensity"] | null
          is_featured: boolean
          is_published: boolean
          name: string
          recommended_max_score: number | null
          recommended_min_score: number | null
          slug: string
          total_steps: number
          trail_id: string
          trail_type: Database["public"]["Enums"]["trail_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discipline_id: string
          duration_days: number
          intensity?: Database["public"]["Enums"]["trail_intensity"] | null
          is_featured?: boolean
          is_published?: boolean
          name: string
          recommended_max_score?: number | null
          recommended_min_score?: number | null
          slug: string
          total_steps?: number
          trail_id?: string
          trail_type: Database["public"]["Enums"]["trail_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discipline_id?: string
          duration_days?: number
          intensity?: Database["public"]["Enums"]["trail_intensity"] | null
          is_featured?: boolean
          is_published?: boolean
          name?: string
          recommended_max_score?: number | null
          recommended_min_score?: number | null
          slug?: string
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
        Relationships: []
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
          ale_question_count: number | null
          ale_question_type: string | null
          context_scenario: string | null
          created_at: string
          has_challenge_mode: boolean | null
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
          ale_question_count?: number | null
          ale_question_type?: string | null
          context_scenario?: string | null
          created_at?: string
          has_challenge_mode?: boolean | null
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
          ale_question_count?: number | null
          ale_question_type?: string | null
          context_scenario?: string | null
          created_at?: string
          has_challenge_mode?: boolean | null
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
      profiles: {
        Row: {
          account_mode: string | null
          ale_result: string | null
          avatar_url: string | null
          comp_exam_date: string | null
          comp_exam_scores: Json | null
          created_at: string | null
          discipline_id: string | null
          display_name: string | null
          enrolled_review_center: string | null
          full_name: string | null
          id: string
          oath_taking_date: string | null
          onboarding_completed_at: string | null
          preferred_study_window: string | null
          previous_exam_subjects_struggled: Json | null
          reviewer_type: string | null
          school_or_institution: string | null
          target_exam_date: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          account_mode?: string | null
          ale_result?: string | null
          avatar_url?: string | null
          comp_exam_date?: string | null
          comp_exam_scores?: Json | null
          created_at?: string | null
          discipline_id?: string | null
          display_name?: string | null
          enrolled_review_center?: string | null
          full_name?: string | null
          id: string
          oath_taking_date?: string | null
          onboarding_completed_at?: string | null
          preferred_study_window?: string | null
          previous_exam_subjects_struggled?: Json | null
          reviewer_type?: string | null
          school_or_institution?: string | null
          target_exam_date?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          account_mode?: string | null
          ale_result?: string | null
          avatar_url?: string | null
          comp_exam_date?: string | null
          comp_exam_scores?: Json | null
          created_at?: string | null
          discipline_id?: string | null
          display_name?: string | null
          enrolled_review_center?: string | null
          full_name?: string | null
          id?: string
          oath_taking_date?: string | null
          onboarding_completed_at?: string | null
          preferred_study_window?: string | null
          previous_exam_subjects_struggled?: Json | null
          reviewer_type?: string | null
          school_or_institution?: string | null
          target_exam_date?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["discipline_id"]
          },
        ]
      }
      questions: {
        Row: {
          application_context: string | null
          code_citation: string | null
          correct_option_id: string
          created_at: string
          difficulty: number | null
          difficulty_rating: number | null
          discrimination_rating: number | null
          explanation: string | null
          is_assessment: boolean | null
          model_id: string | null
          options: Json
          practice_context: string[] | null
          prompt_image_url: string | null
          question_id: string
          rationale: string | null
          text: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          application_context?: string | null
          code_citation?: string | null
          correct_option_id: string
          created_at?: string
          difficulty?: number | null
          difficulty_rating?: number | null
          discrimination_rating?: number | null
          explanation?: string | null
          is_assessment?: boolean | null
          model_id?: string | null
          options?: Json
          practice_context?: string[] | null
          prompt_image_url?: string | null
          question_id?: string
          rationale?: string | null
          text: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          application_context?: string | null
          code_citation?: string | null
          correct_option_id?: string
          created_at?: string
          difficulty?: number | null
          difficulty_rating?: number | null
          discrimination_rating?: number | null
          explanation?: string | null
          is_assessment?: boolean | null
          model_id?: string | null
          options?: Json
          practice_context?: string[] | null
          prompt_image_url?: string | null
          question_id?: string
          rationale?: string | null
          text?: string
          topic_id?: string
          updated_at?: string
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
          accuracy_by_block: Json | null
          completed_at: string | null
          config: Json
          current_question_index: number
          discipline_id: string | null
          is_endurance_session: boolean | null
          is_proof_simulation: boolean | null
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
          is_endurance_session?: boolean | null
          is_proof_simulation?: boolean | null
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
          is_endurance_session?: boolean | null
          is_proof_simulation?: boolean | null
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
          is_proof_simulation: boolean
          score: number
          session_id: string | null
          snapshot_id: string
          sub_scores: Json
          user_id: string
        }
        Insert: {
          analysis_available_at?: string | null
          computed_at?: string
          is_proof_simulation?: boolean
          score: number
          session_id?: string | null
          snapshot_id?: string
          sub_scores?: Json
          user_id: string
        }
        Update: {
          analysis_available_at?: string | null
          computed_at?: string
          is_proof_simulation?: boolean
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
          model_id: string
          node_id: string | null
          phase: string | null
          position_x: number
          position_y: number
          position_z: number
          question_id: string | null
          reveal_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hotspot_id?: string
          model_id: string
          node_id?: string | null
          phase?: string | null
          position_x: number
          position_y: number
          position_z: number
          question_id?: string | null
          reveal_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hotspot_id?: string
          model_id?: string
          node_id?: string | null
          phase?: string | null
          position_x?: number
          position_y?: number
          position_z?: number
          question_id?: string | null
          reveal_order?: number | null
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
          {
            foreignKeyName: "spatial_hotspots_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
        ]
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
          source_type: Database["public"]["Enums"]["taxonomy_source_type"]
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
          ale_id: string | null
          area_weight_pct: number | null
          bloom_level: Database["public"]["Enums"]["bloom_level_type"] | null
          created_at: string
          deprecated_at: string | null
          description: string | null
          difficulty: number | null
          discipline_id: string
          exam_frequency:
            | Database["public"]["Enums"]["exam_frequency_level"]
            | null
          is_computation_heavy: boolean
          is_cross_ref_only: boolean
          is_leaf: boolean
          level: number
          mastery_criteria: Json | null
          name: string
          node_id: string
          node_type: Database["public"]["Enums"]["taxonomy_node_type"] | null
          parent_id: string | null
          prc_area: string | null
          slug: string | null
          subject_area: string
          subject_weight_within_area_pct: number | null
          three_d_lab_linked: boolean
          typical_question_formats: string[]
          updated_at: string
          wiki_items: Json
        }
        Insert: {
          ale_id?: string | null
          area_weight_pct?: number | null
          bloom_level?: Database["public"]["Enums"]["bloom_level_type"] | null
          created_at?: string
          deprecated_at?: string | null
          description?: string | null
          difficulty?: number | null
          discipline_id: string
          exam_frequency?:
            | Database["public"]["Enums"]["exam_frequency_level"]
            | null
          is_computation_heavy?: boolean
          is_cross_ref_only?: boolean
          is_leaf?: boolean
          level: number
          mastery_criteria?: Json | null
          name: string
          node_id?: string
          node_type?: Database["public"]["Enums"]["taxonomy_node_type"] | null
          parent_id?: string | null
          prc_area?: string | null
          slug?: string | null
          subject_area: string
          subject_weight_within_area_pct?: number | null
          three_d_lab_linked?: boolean
          typical_question_formats?: string[]
          updated_at?: string
          wiki_items?: Json
        }
        Update: {
          ale_id?: string | null
          area_weight_pct?: number | null
          bloom_level?: Database["public"]["Enums"]["bloom_level_type"] | null
          created_at?: string
          deprecated_at?: string | null
          description?: string | null
          difficulty?: number | null
          discipline_id?: string
          exam_frequency?:
            | Database["public"]["Enums"]["exam_frequency_level"]
            | null
          is_computation_heavy?: boolean
          is_cross_ref_only?: boolean
          is_leaf?: boolean
          level?: number
          mastery_criteria?: Json | null
          name?: string
          node_id?: string
          node_type?: Database["public"]["Enums"]["taxonomy_node_type"] | null
          parent_id?: string | null
          prc_area?: string | null
          slug?: string | null
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
          {
            foreignKeyName: "teach_back_submissions_trail_day_id_fkey"
            columns: ["trail_day_id"]
            isOneToOne: false
            referencedRelation: "trail_days"
            referencedColumns: ["day_id"]
          },
        ]
      }
      topic_teach_back_criteria: {
        Row: {
          authored_by: string | null
          code_citations: string[]
          common_misconceptions: string[]
          created_at: string | null
          criteria_id: string
          required_concepts: string[]
          required_exceptions: string[]
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          authored_by?: string | null
          code_citations?: string[]
          common_misconceptions?: string[]
          created_at?: string | null
          criteria_id?: string
          required_concepts?: string[]
          required_exceptions?: string[]
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          authored_by?: string | null
          code_citations?: string[]
          common_misconceptions?: string[]
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
          completed_at: string
          day_completion_id: string
          day_id: string
          enrollment_id: string
          readiness_score_at_completion: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          day_completion_id?: string
          day_id: string
          enrollment_id: string
          readiness_score_at_completion?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          day_completion_id?: string
          day_id?: string
          enrollment_id?: string
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
          title: string
          trail_id: string
        }
        Insert: {
          created_at?: string
          day_id?: string
          day_number: number
          description?: string | null
          estimated_minutes?: number | null
          title: string
          trail_id: string
        }
        Update: {
          created_at?: string
          day_id?: string
          day_number?: number
          description?: string | null
          estimated_minutes?: number | null
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
          last_study_date: string | null
          last_touch_campaign: string | null
          last_touch_source: string | null
          onboarding_completed_at: string | null
          onboarding_retaker_framing_shown: boolean
          previous_exam_result: string | null
          proof_simulation_unlocked_at: string | null
          readiness_sub_scores: Json
          referral_code: string | null
          score_reveal_shown_at: string | null
          score_velocity_7d: number | null
          score_velocity_updated_at: string | null
          signup_source: string | null
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
          last_study_date?: string | null
          last_touch_campaign?: string | null
          last_touch_source?: string | null
          onboarding_completed_at?: string | null
          onboarding_retaker_framing_shown?: boolean
          previous_exam_result?: string | null
          proof_simulation_unlocked_at?: string | null
          readiness_sub_scores?: Json
          referral_code?: string | null
          score_reveal_shown_at?: string | null
          score_velocity_7d?: number | null
          score_velocity_updated_at?: string | null
          signup_source?: string | null
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
          last_study_date?: string | null
          last_touch_campaign?: string | null
          last_touch_source?: string | null
          onboarding_completed_at?: string | null
          onboarding_retaker_framing_shown?: boolean
          previous_exam_result?: string | null
          proof_simulation_unlocked_at?: string | null
          readiness_sub_scores?: Json
          referral_code?: string | null
          score_reveal_shown_at?: string | null
          score_velocity_7d?: number | null
          score_velocity_updated_at?: string | null
          signup_source?: string | null
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
          error_type?: string | null
          interaction_id?: string
          interaction_timestamp?: string
          is_correct?: boolean
          is_flagged?: boolean
          is_suspected_lucky_guess?: boolean
          options_eliminated?: number
          question_id?: string
          question_order?: number | null
          rationale_view_ms?: number | null
          selected_option_id?: string | null
          session_id?: string
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
          topic_id: string
          total_attempts: number
          total_correct: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mastery_weight: number
          session_id?: string | null
          snapshot_reason?: string | null
          topic_id: string
          total_attempts?: number
          total_correct?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mastery_weight?: number
          session_id?: string | null
          snapshot_reason?: string | null
          topic_id?: string
          total_attempts?: number
          total_correct?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mastery_history_topic_id"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_tree"
            referencedColumns: ["node_id"]
          },
          {
            foreignKeyName: "user_mastery_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      user_node_mastery: {
        Row: {
          avg_time_ms: number
          consecutive_correct_streak: number
          current_mastery_weight: number
          distinct_questions_seen: number
          ease_factor: number | null
          has_bloom_analyze_correct: boolean
          has_bloom_apply_correct: boolean
          highest_difficulty_correct: number
          last_encountered: string
          next_review_at: string | null
          review_count: number
          review_interval_days: number | null
          teach_back_attempted: boolean | null
          teach_back_gap_count: number | null
          theta: number
          topic_id: string
          total_attempts: number
          total_correct: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_time_ms?: number
          consecutive_correct_streak?: number
          current_mastery_weight?: number
          distinct_questions_seen?: number
          ease_factor?: number | null
          has_bloom_analyze_correct?: boolean
          has_bloom_apply_correct?: boolean
          highest_difficulty_correct?: number
          last_encountered?: string
          next_review_at?: string | null
          review_count?: number
          review_interval_days?: number | null
          teach_back_attempted?: boolean | null
          teach_back_gap_count?: number | null
          theta?: number
          topic_id: string
          total_attempts?: number
          total_correct?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_time_ms?: number
          consecutive_correct_streak?: number
          current_mastery_weight?: number
          distinct_questions_seen?: number
          ease_factor?: number | null
          has_bloom_analyze_correct?: boolean
          has_bloom_apply_correct?: boolean
          highest_difficulty_correct?: number
          last_encountered?: string
          next_review_at?: string | null
          review_count?: number
          review_interval_days?: number | null
          teach_back_attempted?: boolean | null
          teach_back_gap_count?: number | null
          theta?: number
          topic_id?: string
          total_attempts?: number
          total_correct?: number
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
      user_subscriptions: {
        Row: {
          converted_from_source: string | null
          created_at: string
          email_notifications_enabled: boolean | null
          free_cap_reset_date: string | null
          free_questions_today: number
          marketing_emails_enabled: boolean | null
          payrex_customer_id: string | null
          payrex_reference: string | null
          readiness_score_at_conversion: number | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_id: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          trial_started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          converted_from_source?: string | null
          created_at?: string
          email_notifications_enabled?: boolean | null
          free_cap_reset_date?: string | null
          free_questions_today?: number
          marketing_emails_enabled?: boolean | null
          payrex_customer_id?: string | null
          payrex_reference?: string | null
          readiness_score_at_conversion?: number | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          converted_from_source?: string | null
          created_at?: string
          email_notifications_enabled?: boolean | null
          free_cap_reset_date?: string | null
          free_questions_today?: number
          marketing_emails_enabled?: boolean | null
          payrex_customer_id?: string | null
          payrex_reference?: string | null
          readiness_score_at_conversion?: number | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_trail_enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          current_day: number
          current_streak: number
          days_completed: number
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
          completed_at?: string | null
          created_at?: string
          current_day?: number
          current_streak?: number
          days_completed?: number
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
          completed_at?: string | null
          created_at?: string
          current_day?: number
          current_streak?: number
          days_completed?: number
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
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_comments: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          article_id?: string
          content: string
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_comments?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_comments?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      wiki_ei_prompts: {
        Row: {
          article_id: string
          created_at: string
          insert_after_heading: string
          node_id: string | null
          options: Json | null
          prompt_id: string
          prompt_text: string
          reveal_text: string
          updated_at: string
        }
        Insert: {
          article_id: string
          created_at?: string
          insert_after_heading: string
          node_id?: string | null
          options?: Json | null
          prompt_id?: string
          prompt_text: string
          reveal_text: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          created_at?: string
          insert_after_heading?: string
          node_id?: string | null
          options?: Json | null
          prompt_id?: string
          prompt_text?: string
          reveal_text?: string
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
          user_id: string
        }
        Insert: {
          prompt_id: string
          responded_at?: string
          response_id?: string
          response_text?: string | null
          selected_option_index?: number | null
          user_id: string
        }
        Update: {
          prompt_id?: string
          responded_at?: string
          response_id?: string
          response_text?: string | null
          selected_option_index?: number | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      bloom_level_type: "remember" | "understand" | "apply" | "analyze"
      exam_frequency_level: "low" | "medium" | "high"
      session_status: "in_progress" | "completed" | "abandoned"
      subscription_status: "active" | "cancelled" | "expired" | "trialing"
      subscription_tier: "free" | "pro" | "enterprise"
      taxonomy_node_type:
        | "concept"
        | "code_provision"
        | "formula"
        | "case_study"
        | "person"
        | "building"
      taxonomy_source_type:
        | "primary_law"
        | "implementing_rules"
        | "regulatory_body"
        | "reference_standard"
        | "prc_syllabus"
        | "heritage_body"
      test_mode: "camp" | "timed" | "practice"
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
      exam_frequency_level: ["low", "medium", "high"],
      session_status: ["in_progress", "completed", "abandoned"],
      subscription_status: ["active", "cancelled", "expired", "trialing"],
      subscription_tier: ["free", "pro", "enterprise"],
      taxonomy_node_type: [
        "concept",
        "code_provision",
        "formula",
        "case_study",
        "person",
        "building",
      ],
      taxonomy_source_type: [
        "primary_law",
        "implementing_rules",
        "regulatory_body",
        "reference_standard",
        "prc_syllabus",
        "heritage_body",
      ],
      test_mode: ["camp", "timed", "practice"],
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
