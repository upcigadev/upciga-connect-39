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
      appointments: {
        Row: {
          cliente_nome: string | null
          created_at: string
          data: string
          endereco: string | null
          funcionario_nome: string | null
          hora: string
          id: number
          modalidade: string | null
          tipo: string
          urgencia: string | null
          valor: number | null
        }
        Insert: {
          cliente_nome?: string | null
          created_at?: string
          data: string
          endereco?: string | null
          funcionario_nome?: string | null
          hora: string
          id?: number
          modalidade?: string | null
          tipo: string
          urgencia?: string | null
          valor?: number | null
        }
        Update: {
          cliente_nome?: string | null
          created_at?: string
          data?: string
          endereco?: string | null
          funcionario_nome?: string | null
          hora?: string
          id?: number
          modalidade?: string | null
          tipo?: string
          urgencia?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          documento: string | null
          etiqueta: string | null
          id: number
          nome: string
          produtos: string[] | null
          telefone: string | null
          tipo: string | null
        }
        Insert: {
          created_at?: string
          documento?: string | null
          etiqueta?: string | null
          id?: number
          nome: string
          produtos?: string[] | null
          telefone?: string | null
          tipo?: string | null
        }
        Update: {
          created_at?: string
          documento?: string | null
          etiqueta?: string | null
          id?: number
          nome?: string
          produtos?: string[] | null
          telefone?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          agendamentos_hoje: number | null
          cpf: string
          created_at: string
          funcao: string | null
          id: number
          nome: string
          servicos: string[] | null
          status: string | null
        }
        Insert: {
          agendamentos_hoje?: number | null
          cpf: string
          created_at?: string
          funcao?: string | null
          id?: number
          nome: string
          servicos?: string[] | null
          status?: string | null
        }
        Update: {
          agendamentos_hoje?: number | null
          cpf?: string
          created_at?: string
          funcao?: string | null
          id?: number
          nome?: string
          servicos?: string[] | null
          status?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: number
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: number
          nome: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: number
          nome?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          nome?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          role?: string | null
        }
        Relationships: []
      }
      schedule_blocks: {
        Row: {
          created_at: string
          data_fim: string
          data_inicio: string
          descricao: string
          funcionario_id: number | null
          hora_fim: string | null
          hora_inicio: string | null
          id: number
          tipo: string
        }
        Insert: {
          created_at?: string
          data_fim: string
          data_inicio: string
          descricao: string
          funcionario_id?: number | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: number
          tipo?: string
        }
        Update: {
          created_at?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string
          funcionario_id?: number | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_blocks_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: number
          nome: string
          valor_padrao: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: number
          nome: string
          valor_padrao?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: number
          nome?: string
          valor_padrao?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          chave: string
          created_at: string
          id: number
          updated_at: string
          valor: string | null
        }
        Insert: {
          chave: string
          created_at?: string
          id?: number
          updated_at?: string
          valor?: string | null
        }
        Update: {
          chave?: string
          created_at?: string
          id?: number
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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
