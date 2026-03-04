import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Aluno } from '@/types/database';

export function useAlunos() {
  return useQuery({
    queryKey: ['alunos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alunos')
        .select('*, planos(*)')
        .order('nome');
      if (error) throw error;
      return data as Aluno[];
    },
  });
}

export function useCreateAluno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (aluno: Omit<Aluno, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'planos'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('alunos').insert({ ...aluno, user_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alunos'] }),
  });
}

export function useUpdateAluno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...aluno }: Partial<Aluno> & { id: string }) => {
      const { data, error } = await supabase.from('alunos').update(aluno).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alunos'] }),
  });
}
