import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AuditLog {
  id: number;
  table_name: string;
  record_id: string;
  action: 'create' | 'update' | 'delete';
  changed_by: string;
  changes: any;
  created_at: string;
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      // Using type assertion since audit_logs may not be in generated types
      const { data, error } = await (supabase as any)
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Erro ao buscar logs: ${error.message}`);
      }

      return (data ?? []) as AuditLog[];
    },
  });
}

export function useCreateAuditLog() {
  const { user } = useAuth();

  const createAuditLog = async (
    tableName: string,
    recordId: string | number,
    action: 'create' | 'update' | 'delete',
    changes?: any
  ) => {
    if (!user?.email) {
      console.warn('Usuário não autenticado, não é possível criar log de auditoria');
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('audit_logs')
        .insert({
          table_name: tableName,
          record_id: String(recordId),
          action,
          changed_by: user.email,
          changes: changes || null,
        });

      if (error) {
        console.error('Erro ao criar log de auditoria:', error);
      }
    } catch (error) {
      console.error('Erro ao criar log de auditoria:', error);
    }
  };

  return createAuditLog;
}

