// Hand-written types mirroring supabase/migrations/0001_initial_schema.sql.
// Regenerate with `supabase gen types typescript` once the project is linked.

export type UserRole = "learner" | "instructor";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          preferred_language: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: UserRole;
          preferred_language?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          preferred_language?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          instructor_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          instructor_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          instructor_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      class_members: {
        Row: {
          class_id: string;
          student_id: string;
          created_at: string;
        };
        Insert: {
          class_id: string;
          student_id: string;
          created_at?: string;
        };
        Update: {
          class_id?: string;
          student_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          module_code: string;
          title: string;
          body_markdown: string;
          language: string;
          difficulty: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_code: string;
          title: string;
          body_markdown: string;
          language?: string;
          difficulty?: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_code?: string;
          title?: string;
          body_markdown?: string;
          language?: string;
          difficulty?: string;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      circuits: {
        Row: {
          id: string;
          user_id: string;
          circuit_json: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          circuit_json: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          circuit_json?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          id: string;
          module_code: string;
          difficulty: string;
          prompt: string;
          starter_data: Record<string, unknown> | null;
          grading_rule: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_code: string;
          difficulty?: string;
          prompt: string;
          starter_data?: Record<string, unknown> | null;
          grading_rule?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_code?: string;
          difficulty?: string;
          prompt?: string;
          starter_data?: Record<string, unknown> | null;
          grading_rule?: Record<string, unknown> | null;
          created_at?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          submitted_data: Record<string, unknown>;
          score: number | null;
          ai_feedback: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          submitted_data: Record<string, unknown>;
          score?: number | null;
          ai_feedback?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          submitted_data?: Record<string, unknown>;
          score?: number | null;
          ai_feedback?: string | null;
          timestamp?: string;
        };
        Relationships: [];
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          module_code: string;
          lesson_id: string | null;
          status: string;
          score: number | null;
          last_accessed: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_code: string;
          lesson_id?: string | null;
          status?: string;
          score?: number | null;
          last_accessed?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_code?: string;
          lesson_id?: string | null;
          status?: string;
          score?: number | null;
          last_accessed?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
