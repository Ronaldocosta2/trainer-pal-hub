
-- Fix RLS policies to be PERMISSIVE (drop restrictive ones and recreate)
DROP POLICY IF EXISTS "Users manage own alunos" ON public.alunos;
DROP POLICY IF EXISTS "Users manage own planos" ON public.planos;
DROP POLICY IF EXISTS "Users manage own pagamentos" ON public.pagamentos;

CREATE POLICY "Users manage own alunos" ON public.alunos
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own planos" ON public.planos
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own pagamentos" ON public.pagamentos
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
