import { useState } from 'react';
import { useAlunos, useCreateAluno, useUpdateAluno } from '@/hooks/useAlunos';
import { usePlanos } from '@/hooks/usePlanos';
import { useCreatePagamento } from '@/hooks/usePagamentos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, UserCheck, UserX, Pencil, MessageCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Aluno } from '@/types/database';
import { AlunoForm, AlunoFormData } from '@/components/AlunoForm';
import { openWhatsApp } from '@/lib/whatsapp';

export default function Alunos() {
  const { data: alunos = [], isLoading } = useAlunos();
  const { data: planos = [] } = usePlanos();
  const createAluno = useCreateAluno();
  const updateAluno = useUpdateAluno();
  const createPagamento = useCreatePagamento();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);

  const filtered = alunos.filter(a =>
    a.nome.toLowerCase().includes(search.toLowerCase())
  );

  const ativos = alunos.filter(a => a.ativo).length;
  const inativos = alunos.length - ativos;

  const handleCreate = async (form: AlunoFormData) => {
    try {
      const aluno = await createAluno.mutateAsync({
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

      if (aluno && Number(form.valor_mensalidade) > 0) {
        const today = new Date();
        const diaVenc = Number(form.dia_vencimento) || 10;
        let vencimento = new Date(today.getFullYear(), today.getMonth(), diaVenc);
        if (vencimento < today) {
          vencimento = new Date(today.getFullYear(), today.getMonth() + 1, diaVenc);
        }

        await createPagamento.mutateAsync({
          aluno_id: aluno.id,
          valor: Number(form.valor_mensalidade),
          data_vencimento: vencimento.toISOString().split('T')[0],
          status: form.pagamento_status,
        });
      }

      toast({ title: 'Aluno cadastrado com pagamento!' });
      setCreateOpen(false);
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = async (form: AlunoFormData) => {
    if (!editingAluno) return;
    try {
      await updateAluno.mutateAsync({
        id: editingAluno.id,
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
        endereco: form.endereco || null,
        contato_emergencia: form.contato_emergencia || null,
        ativo: form.ativo,
      });
      toast({ title: 'Aluno atualizado!' });
      setEditOpen(false);
      setEditingAluno(null);
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const openEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setEditOpen(true);
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await updateAluno.mutateAsync({ id, ativo: !ativo });
    toast({ title: ativo ? 'Aluno inativado' : 'Aluno reativado' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">Gerencie seus alunos e pagamentos</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" /> Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar Aluno</DialogTitle>
            </DialogHeader>
            <AlunoForm planos={planos} onSubmit={handleCreate} isLoading={createAluno.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{alunos.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <UserCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ativos}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <UserX className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inativos}</p>
              <p className="text-xs text-muted-foreground">Inativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditingAluno(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
          </DialogHeader>
          <AlunoForm planos={planos} initialData={editingAluno} onSubmit={handleEdit} isLoading={updateAluno.isPending} isEdit />
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar aluno por nome..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Table */}
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
                  <TableRow key={aluno.id} className="group">
                    <TableCell className="font-medium">{aluno.nome}</TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm">{aluno.telefone}</TableCell>
                    <TableCell className="hidden lg:table-cell">{aluno.objetivo || '—'}</TableCell>
                    <TableCell className="font-semibold">R$ {Number(aluno.valor_mensalidade).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={aluno.ativo ? 'default' : 'secondary'} className={aluno.ativo ? 'bg-success/15 text-success border-success/30' : ''}>
                        {aluno.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(aluno)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openWhatsApp(aluno.telefone, `Olá ${aluno.nome}! 👋`)} title="WhatsApp">
                          <MessageCircle className="h-4 w-4 text-success" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toggleAtivo(aluno.id, aluno.ativo)} title={aluno.ativo ? 'Inativar' : 'Reativar'}>
                          {aluno.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
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
