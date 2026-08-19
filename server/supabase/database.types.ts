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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      assessment_answers: {
        Row: {
          assessment_question_id: number
          option_id: number
        }
        Insert: {
          assessment_question_id: number
          option_id: number
        }
        Update: {
          assessment_question_id?: number
          option_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_answers_aq"
            columns: ["assessment_question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_answers_options"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_categories: {
        Row: {
          assessment_id: number
          category_id: number
        }
        Insert: {
          assessment_id: number
          category_id: number
        }
        Update: {
          assessment_id?: number
          category_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_assessment_categories_assessments"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assessment_categories_categories"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_category_scores: {
        Row: {
          assessment_id: number
          category_id: number
          id: number
          is_weak_area: boolean
          score_percentage: number
        }
        Insert: {
          assessment_id: number
          category_id: number
          id?: never
          is_weak_area?: boolean
          score_percentage: number
        }
        Update: {
          assessment_id?: number
          category_id?: number
          id?: never
          is_weak_area?: boolean
          score_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_category_scores_assessments"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_category_scores_categories"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          answered_at: string | null
          assessment_id: number
          id: number
          is_correct: boolean | null
          position: number
          question_id: number
        }
        Insert: {
          answered_at?: string | null
          assessment_id: number
          id?: never
          is_correct?: boolean | null
          position: number
          question_id: number
        }
        Update: {
          answered_at?: string | null
          assessment_id?: number
          id?: never
          is_correct?: boolean | null
          position?: number
          question_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_aq_assessments"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aq_questions"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          completed_at: string | null
          id: number
          is_surprise_mode: boolean
          started_at: string
          status: string
          total_score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: never
          is_surprise_mode?: boolean
          started_at?: string
          status?: string
          total_score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: never
          is_surprise_mode?: boolean
          started_at?: string
          status?: string
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assessments_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          level: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          is_active?: boolean
          level?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: never
          is_active?: boolean
          level?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_recommendations: {
        Row: {
          advice_description: string | null
          assessment_id: number
          category_id: number
          created_at: string
          id: number
          priority: string
          status: string
          topic_title: string
        }
        Insert: {
          advice_description?: string | null
          assessment_id: number
          category_id: number
          created_at?: string
          id?: never
          priority?: string
          status?: string
          topic_title: string
        }
        Update: {
          advice_description?: string | null
          assessment_id?: number
          category_id?: number
          created_at?: string
          id?: never
          priority?: string
          status?: string
          topic_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_recommendations_assessments"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_recommendations_categories"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          is_active?: boolean
          last_name: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          id: number
          is_correct: boolean
          option_text: string
          question_id: number
        }
        Insert: {
          id?: never
          is_correct?: boolean
          option_text: string
          question_id: number
        }
        Update: {
          id?: never
          is_correct?: boolean
          option_text?: string
          question_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_question_options_questions"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          category_id: number
          created_at: string
          created_by: string | null
          difficulty: string
          id: number
          is_active: boolean
          question_text: string
          question_type: string
          status: string
        }
        Insert: {
          category_id: number
          created_at?: string
          created_by?: string | null
          difficulty: string
          id?: never
          is_active?: boolean
          question_text: string
          question_type?: string
          status?: string
        }
        Update: {
          category_id?: number
          created_at?: string
          created_by?: string | null
          difficulty?: string
          id?: never
          is_active?: boolean
          question_text?: string
          question_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_questions_categories"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_questions_creator"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_resources: {
        Row: {
          id: number
          recommendation_id: number
          title: string
          url: string
        }
        Insert: {
          id?: never
          recommendation_id: number
          title: string
          url: string
        }
        Update: {
          id?: never
          recommendation_id?: number
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_resources_recommendations"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "learning_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          current_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_profiles_profiles"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
