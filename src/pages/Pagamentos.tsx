import { useState } from 'react';
import { usePagamentos, useCreatePagamento, useUpdatePagamento } from '@/hooks/usePagamentos';
import { useAlunos } from '@/hooks/useAlunos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, Check, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function Pagamentos() {
  const { data: pagamentos = [], isLoading } = usePagamentos();
  const { data: alunos = [] } = useAlunos();
  const createPagamento = useCreatePagamento();
  const updatePagamento = useUpdatePagamento();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [form, setForm] = useState({ aluno_id: '', valor: '', data_vencimento: '', status: 'pendente' as const });

  const filtered = pagamentos.filter(p => {
    const matchesSearch = (p as any).alunos?.nome?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPagamento.mutateAsync({
        aluno_id: form.aluno_id,
        valor: Number(form.valor),
        data_vencimento: form.data_vencimento,
        status: form.status,
      });
      toast({ title: 'Pagamento registrado!' });
      setOpen(false);
      setForm({ aluno_id: '', valor: '', data_vencimento: '', status: 'pendente' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const marcarPago = async (id: string) => {
    await updatePagamento.mutateAsync({ id, status: 'pago', data_pagamento: new Date().toISOString().split('T')[0] });
    toast({ title: 'Pagamento confirmado!' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">Controle financeiro dos alunos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Pagamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Aluno *</Label>
                <Select value={form.aluno_id} onValueChange={v => {
                  const aluno = alunos.find(a => a.id === v);
                  setForm({...form, aluno_id: v, valor: aluno ? String(aluno.valor_mensalidade) : form.valor });
                }}>
                  <SelectTrigger><SelectValue placeholder="Selecione o aluno" /></SelectTrigger>
                  <SelectContent>
                    {alunos.filter(a => a.ativo).map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$) *</Label>
                  <Input type="number" step="0.01" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Vencimento *</Label>
                  <Input type="date" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createPagamento.isPending}>
                {createPagamento.isPending ? 'Salvando...' : 'Registrar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por aluno..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum pagamento encontrado</TableCell></TableRow>
              ) : (
                filtered.map(pag => (
                  <TableRow key={pag.id}>
                    <TableCell className="font-medium">{(pag as any).alunos?.nome ?? '—'}</TableCell>
                    <TableCell>{format(parseISO(pag.data_vencimento), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>R$ {Number(pag.valor).toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={pag.status} /></TableCell>
                    <TableCell className="text-right">
                      {pag.status !== 'pago' && (
                        <Button variant="ghost" size="icon" onClick={() => marcarPago(pag.id)} title="Marcar como pago">
                          <Check className="h-4 w-4 text-success" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
