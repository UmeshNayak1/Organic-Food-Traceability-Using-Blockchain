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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      entry_products: {
        Row: {
          batch_number: string
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number
          received_date: string | null
          received_from: string | null
          user_id: string
        }
        Insert: {
          batch_number: string
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          received_date?: string | null
          received_from?: string | null
          user_id: string
        }
        Update: {
          batch_number?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          received_date?: string | null
          received_from?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      exit_products: {
        Row: {
          assigned_to: string
          created_at: string | null
          entry_product_id: string
          exit_date: string | null
          id: string
          notes: string | null
          quantity: number
          user_id: string
        }
        Insert: {
          assigned_to: string
          created_at?: string | null
          entry_product_id: string
          exit_date?: string | null
          id?: string
          notes?: string | null
          quantity: number
          user_id: string
        }
        Update: {
          assigned_to?: string
          created_at?: string | null
          entry_product_id?: string
          exit_date?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exit_products_entry_product_id_fkey"
            columns: ["entry_product_id"]
            isOneToOne: false
            referencedRelation: "entry_products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          certification: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          origin: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          certification?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          origin?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          certification?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          origin?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          full_name: string
          id: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      supply_chain_events: {
        Row: {
          batch_number: string
          event_type: string
          from_user: string | null
          id: string
          metadata: Json | null
          product_id: string
          quantity: number | null
          timestamp: string | null
          to_user: string | null
          transaction_hash: string | null
        }
        Insert: {
          batch_number: string
          event_type: string
          from_user?: string | null
          id?: string
          metadata?: Json | null
          product_id: string
          quantity?: number | null
          timestamp?: string | null
          to_user?: string | null
          transaction_hash?: string | null
        }
        Update: {
          batch_number?: string
          event_type?: string
          from_user?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string
          quantity?: number | null
          timestamp?: string | null
          to_user?: string | null
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_chain_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      used_today: {
        Row: {
          created_at: string | null
          entry_product_id: string
          id: string
          notes: string | null
          quantity: number
          used_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_product_id: string
          id?: string
          notes?: string | null
          quantity: number
          used_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entry_product_id?: string
          id?: string
          notes?: string | null
          quantity?: number
          used_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "used_today_entry_product_id_fkey"
            columns: ["entry_product_id"]
            isOneToOne: false
            referencedRelation: "entry_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "farmer"
        | "manufacturer"
        | "distributor"
        | "retailer"
        | "consumer"
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
      user_role: [
        "farmer",
        "manufacturer",
        "distributor",
        "retailer",
        "consumer",
      ],
    },
  },
} as const
