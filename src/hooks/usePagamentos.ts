import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Pagamento } from '@/types/database';

export function usePagamentos() {
  return useQuery({
    queryKey: ['pagamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*, alunos(nome, telefone, email, planos(frequencia))')
        .order('data_vencimento', { ascending: false });
      if (error) throw error;
      return data as Pagamento[];
    },
  });
}

export function useCreatePagamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pag: Pick<Pagamento, 'aluno_id' | 'valor' | 'data_vencimento' | 'status'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('pagamentos').insert({ ...pag, user_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pagamentos'] }),
  });
}

export function useUpdatePagamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...pag }: Partial<Pagamento> & { id: string }) => {
      const { data, error } = await supabase.from('pagamentos').update(pag).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pagamentos'] }),
  });
}
