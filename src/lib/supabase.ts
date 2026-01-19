import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase ahora es OPCIONAL (solo para storage de archivos)
// La autenticación se hace localmente con PostgreSQL
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase conectado (storage de archivos disponible)');
} else {
  console.warn('⚠️ Supabase no configurado - Storage de archivos no disponible');
}

export { supabase };

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'basic_user' | 'area_coordinator';
          department: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'basic_user' | 'area_coordinator';
          department?: string;
          location?: string;
        };
        Update: {
          full_name?: string;
          role?: 'basic_user' | 'area_coordinator';
          department?: string;
          location?: string;
        };
      };
      utility_bills: {
        Row: {
          id: string;
          user_id: string;
          service_type: string;
          provider: string | null;
          description: string | null;
          value: number;
          period: string;
          invoice_number: string | null;
          contract_number: string | null;
          total_amount: number;
          consumption: number | null;
          unit_of_measure: string | null;
          cost_center: string | null;
          location: string;
          due_date: string;
          document_url: string | null;
          document_name: string | null;
          status: string;
          notes: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          service_type: string;
          provider?: string;
          description?: string;
          value: number;
          period: string;
          invoice_number?: string;
          contract_number?: string;
          total_amount: number;
          consumption?: number;
          unit_of_measure?: string;
          cost_center?: string;
          location: string;
          due_date: string;
          document_url?: string;
          document_name?: string;
          status?: string;
          notes?: string;
        };
        Update: {
          service_type?: string;
          provider?: string;
          description?: string;
          value?: number;
          period?: string;
          invoice_number?: string;
          contract_number?: string;
          total_amount?: number;
          consumption?: number;
          unit_of_measure?: string;
          cost_center?: string;
          location?: string;
          due_date?: string;
          document_url?: string;
          document_name?: string;
          status?: string;
          notes?: string;
          approved_by?: string;
          approved_at?: string;
        };
      };
      bill_consumptions: {
        Row: {
          id: string;
          bill_id: string;
          service_type: string;
          provider: string;
          period_from: string;
          period_to: string;
          value: number;
          total_amount: number;
          consumption: number | null;
          unit_of_measure: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          bill_id: string;
          service_type: string;
          provider: string;
          period_from: string;
          period_to: string;
          value: number;
          total_amount: number;
          consumption?: number;
          unit_of_measure?: string;
        };
        Update: {
          service_type?: string;
          provider?: string;
          period_from?: string;
          period_to?: string;
          value?: number;
          total_amount?: number;
          consumption?: number;
          unit_of_measure?: string;
        };
      };
      budget_thresholds: {
        Row: {
          id: string;
          service_type: string;
          location: string;
          monthly_limit: number;
          warning_threshold: number;
          created_at: string;
          updated_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          bill_id: string | null;
          type: string;
          message: string;
          read: boolean;
          created_at: string;
        };
      };
    };
  };
}
