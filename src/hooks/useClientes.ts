import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Cliente {
  id: number;
  nome: string;
  documento: string;
  tipo: 'PF' | 'PJ';
  telefone: string;
  etiqueta: 'green' | 'blue' | 'red';
  produtos: string[];
}

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar clientes: ${error.message}`);
      }

      // Validação: garantir que data não seja null
      if (!data) {
        throw new Error('Nenhum dado retornado do Supabase');
      }

      // Validação e transformação dos dados
      const clientes: Cliente[] = data.map((cliente) => {
        // Garantir que produtos seja sempre um array
        let produtos: string[] = [];
        if (Array.isArray(cliente.produtos)) {
          produtos = cliente.produtos;
        } else if (typeof cliente.produtos === 'string') {
          // Se produtos vier como string JSON, fazer parse
          try {
            produtos = JSON.parse(cliente.produtos);
          } catch {
            produtos = [];
          }
        }

        return {
          id: cliente.id,
          nome: cliente.nome || '',
          documento: cliente.documento || '',
          tipo: (cliente.tipo === 'PF' || cliente.tipo === 'PJ' ? cliente.tipo : 'PF') as 'PF' | 'PJ',
          telefone: cliente.telefone || '',
          etiqueta: (['green', 'blue', 'red'].includes(cliente.etiqueta) 
            ? cliente.etiqueta 
            : 'blue') as 'green' | 'blue' | 'red',
          produtos,
        };
      });

      return clientes;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos - dados considerados frescos por 5 min
    gcTime: 1000 * 60 * 10, // 10 minutos - cache mantido por 10 min (anteriormente cacheTime)
  });
}