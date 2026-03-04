import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plano } from '@/types/database';

export function usePlanos() {
  return useQuery({
    queryKey: ['planos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('planos').select('*').order('nome');
      if (error) throw error;
      return data as Plano[];
    },
  });
}

export function useCreatePlano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plano: Pick<Plano, 'nome' | 'descricao' | 'valor' | 'frequencia'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('planos').insert({ ...plano, user_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planos'] }),
  });
}

export function useUpdatePlano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...plano }: Partial<Plano> & { id: string }) => {
      const { data, error } = await supabase.from('planos').update(plano).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planos'] }),
  });
}
