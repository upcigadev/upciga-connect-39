export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          created_at: string
          email: string | null
          id: string
          nome: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]