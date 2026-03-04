import { useState } from 'react';
import { useAlunos, useCreateAluno, useUpdateAluno } from '@/hooks/useAlunos';
import { usePlanos } from '@/hooks/usePlanos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Alunos() {
  const { data: alunos = [], isLoading } = useAlunos();
  const { data: planos = [] } = usePlanos();
  const createAluno = useCreateAluno();
  const updateAluno = useUpdateAluno();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: '', telefone: '', email: '', data_nascimento: '',
    objetivo: '', observacoes: '', data_inicio: new Date().toISOString().split('T')[0],
    plano_id: '', valor_mensalidade: '', dia_vencimento: '10',
    endereco: '', contato_emergencia: '', ativo: true,
  });

  const filtered = alunos.filter(a =>
    a.nome.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({
      nome: '', telefone: '', email: '', data_nascimento: '',
      objetivo: '', observacoes: '', data_inicio: new Date().toISOString().split('T')[0],
      plano_id: '', valor_mensalidade: '', dia_vencimento: '10',
      endereco: '', contato_emergencia: '', ativo: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAluno.mutateAsync({
        nome: form.nome,
        telefone: form.telefone,
        email: form.email,
        data_nascimento: form.data_nascimento || null,
        objetivo: form.objetivo || null,
        observacoes: form.observacoes || null,
        data_inicio: form.data_inicio,
        plano_id: form.plano_id || null,
        valor_mensalidade: Number(form.valor_mensalidade) || 0,
        dia_vencimento: Number(form.dia_vencimento) || 10,
        foto_url: null,
        endereco: form.endereco || null,
        contato_emergencia: form.contato_emergencia || null,
        ativo: true,
      });
      toast({ title: 'Aluno cadastrado!' });
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await updateAluno.mutateAsync({ id, ativo: !ativo });
    toast({ title: ativo ? 'Aluno inativado' : 'Aluno reativado' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">{alunos.filter(a => a.ativo).length} ativos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Aluno</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar Aluno</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Nome completo *</Label>
                  <Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Telefone *</Label>
                  <Input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input type="date" value={form.data_nascimento} onChange={e => setForm({...form, data_nascimento: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input type="date" value={form.data_inicio} onChange={e => setForm({...form, data_inicio: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Objetivo</Label>
                  <Input value={form.objetivo} onChange={e => setForm({...form, objetivo: e.target.value})} placeholder="Ex: Hipertrofia" />
                </div>
                <div className="space-y-2">
                  <Label>Plano</Label>
                  <Select value={form.plano_id} onValueChange={v => {
                    const plano = planos.find(p => p.id === v);
                    setForm({...form, plano_id: v, valor_mensalidade: plano ? String(plano.valor) : form.valor_mensalidade });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {planos.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nome} - R$ {Number(p.valor).toFixed(2)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor Mensalidade</Label>
                  <Input type="number" step="0.01" value={form.valor_mensalidade} onChange={e => setForm({...form, valor_mensalidade: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Dia Vencimento</Label>
                  <Input type="number" min="1" max="31" value={form.dia_vencimento} onChange={e => setForm({...form, dia_vencimento: e.target.value})} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Observações</Label>
                  <Textarea value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} placeholder="Observações médicas ou físicas" />
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Contato de Emergência</Label>
                  <Input value={form.contato_emergencia} onChange={e => setForm({...form, contato_emergencia: e.target.value})} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createAluno.isPending}>
                {createAluno.isPending ? 'Salvando...' : 'Cadastrar Aluno'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar aluno por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Telefone</TableHead>
                <TableHead className="hidden lg:table-cell">Objetivo</TableHead>
                <TableHead>Mensalidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum aluno encontrado</TableCell></TableRow>
              ) : (
                filtered.map(aluno => (
                  <TableRow key={aluno.id}>
                    <TableCell className="font-medium">{aluno.nome}</TableCell>
                    <TableCell className="hidden md:table-cell">{aluno.telefone}</TableCell>
                    <TableCell className="hidden lg:table-cell">{aluno.objetivo || '—'}</TableCell>
                    <TableCell>R$ {Number(aluno.valor_mensalidade).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={aluno.ativo ? 'default' : 'secondary'} className={aluno.ativo ? 'bg-success/15 text-success border-success/30' : ''}>
                        {aluno.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => toggleAtivo(aluno.id, aluno.ativo)} title={aluno.ativo ? 'Inativar' : 'Reativar'}>
                        {aluno.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
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
