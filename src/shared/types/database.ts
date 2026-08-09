// Auto-generated from Supabase schema (project: Dental-CRM / gjllrgqxgyxzuvxtbjbe).
// Regenerate with the Supabase MCP `generate_typescript_types` tool after any migration.

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
      access_log: {
        Row: {
          action: string
          clinic_id: string
          created_at: string
          id: string
          patient_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          clinic_id: string
          created_at?: string
          id?: string
          patient_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          clinic_id?: string
          created_at?: string
          id?: string
          patient_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_log_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          branch_id: string | null
          clinic_id: string
          created_at: string
          created_by: string | null
          doctor_id: string
          duration_minutes: number
          estimated_price: number | null
          id: string
          notes: string | null
          patient_id: string
          scheduled_at: string
          service_id: string | null
          service_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          clinic_id: string
          created_at?: string
          created_by?: string | null
          doctor_id: string
          duration_minutes?: number
          estimated_price?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          scheduled_at: string
          service_id?: string | null
          service_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          doctor_id?: string
          duration_minutes?: number
          estimated_price?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          scheduled_at?: string
          service_id?: string | null
          service_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          clinic_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          clinic_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          clinic_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_secrets: {
        Row: {
          clinic_id: string
          telegram_bot_token: string | null
          updated_at: string
        }
        Insert: {
          clinic_id: string
          telegram_bot_token?: string | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          telegram_bot_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_secrets_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_services: {
        Row: {
          clinic_id: string
          created_at: string
          default_price: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          default_price?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          default_price?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
          working_hours?: Json | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          clinic_id: string
          created_at: string
          id: string
          min_quantity: number
          name: string
          quantity: number
          unit: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          category?: string
          clinic_id: string
          created_at?: string
          id?: string
          min_quantity?: number
          name: string
          quantity?: number
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          clinic_id?: string
          created_at?: string
          id?: string
          min_quantity?: number
          name?: string
          quantity?: number
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          note: string | null
          quantity: number
          type: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          note?: string | null
          quantity: number
          type: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          note?: string | null
          quantity?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          appointment_id: string | null
          channel: string
          clinic_id: string
          created_at: string
          id: string
          message: string | null
          patient_id: string | null
          recall_id: string | null
          sent_at: string | null
          status: string
          type: string
        }
        Insert: {
          appointment_id?: string | null
          channel?: string
          clinic_id: string
          created_at?: string
          id?: string
          message?: string | null
          patient_id?: string | null
          recall_id?: string | null
          sent_at?: string | null
          status?: string
          type: string
        }
        Update: {
          appointment_id?: string | null
          channel?: string
          clinic_id?: string
          created_at?: string
          id?: string
          message?: string | null
          patient_id?: string | null
          recall_id?: string | null
          sent_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recall_id_fkey"
            columns: ["recall_id"]
            isOneToOne: false
            referencedRelation: "recall_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medical_notes: {
        Row: {
          clinic_id: string
          created_at: string
          notes: string | null
          patient_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          notes?: string | null
          patient_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          notes?: string | null
          patient_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_medical_notes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medical_notes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string | null
          clinic_id: string
          created_at: string
          created_by: string | null
          first_visit_date: string
          full_name: string
          id: string
          phone: string
          telegram_id: number | null
          telegram_username: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          clinic_id: string
          created_at?: string
          created_by?: string | null
          first_visit_date?: string
          full_name: string
          id?: string
          phone: string
          telegram_id?: number | null
          telegram_username?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          first_visit_date?: string
          full_name?: string
          id?: string
          phone?: string
          telegram_id?: number | null
          telegram_username?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          clinic_id: string
          created_at: string
          id: string
          paid_at: string
          patient_id: string
          payment_type: string
          received_by: string
          treatment_plan_id: string | null
        }
        Insert: {
          amount: number
          clinic_id: string
          created_at?: string
          id?: string
          paid_at?: string
          patient_id: string
          payment_type: string
          received_by: string
          treatment_plan_id?: string | null
        }
        Update: {
          amount?: number
          clinic_id?: string
          created_at?: string
          id?: string
          paid_at?: string
          patient_id?: string
          payment_type?: string
          received_by?: string
          treatment_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plan_balances"
            referencedColumns: ["treatment_plan_id"]
          },
          {
            foreignKeyName: "payments_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      recall_schedule: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          created_at: string
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string
          recall_date: string
          reminder_sent_at: string | null
          status: string
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          recall_date: string
          reminder_sent_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          recall_date?: string
          reminder_sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "recall_schedule_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recall_schedule_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recall_schedule_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recall_schedule_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_patients: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          linked_at: string | null
          patient_id: string | null
          phone: string | null
          telegram_chat_id: number
          telegram_username: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          linked_at?: string | null
          patient_id?: string | null
          phone?: string | null
          telegram_chat_id: number
          telegram_username?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          linked_at?: string | null
          patient_id?: string | null
          phone?: string | null
          telegram_chat_id?: number
          telegram_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_patients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      tooth_records: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          description: string | null
          diagnosis: string
          doctor_id: string
          id: string
          patient_id: string
          price: number
          record_date: string
          service_id: string | null
          status: string
          tooth_number: number
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          diagnosis: string
          doctor_id: string
          id?: string
          patient_id: string
          price?: number
          record_date?: string
          service_id?: string | null
          status?: string
          tooth_number: number
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          diagnosis?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          price?: number
          record_date?: string
          service_id?: string | null
          status?: string
          tooth_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "tooth_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tooth_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tooth_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tooth_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tooth_records_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_items: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          price: number
          quantity: number
          service_id: string | null
          service_name: string
          treatment_plan_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          price?: number
          quantity?: number
          service_id?: string | null
          service_name: string
          treatment_plan_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          price?: number
          quantity?: number
          service_id?: string | null
          service_name?: string
          treatment_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_items_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_items_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plan_balances"
            referencedColumns: ["treatment_plan_id"]
          },
          {
            foreignKeyName: "treatment_items_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plans: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          status: string
          title: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          status?: string
          title?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          status?: string
          title?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          branch_id: string | null
          clinic_id: string | null
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: string
          username: string
        }
        Insert: {
          branch_id?: string | null
          clinic_id?: string | null
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role: string
          username: string
        }
        Update: {
          branch_id?: string | null
          clinic_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      treatment_plan_balances: {
        Row: {
          clinic_id: string | null
          paid_amount: number | null
          patient_id: string | null
          remaining_amount: number | null
          total_amount: number | null
          treatment_plan_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      current_clinic_id: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
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
