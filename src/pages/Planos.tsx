import { useState } from 'react';
import { usePlanos, useCreatePlano, useUpdatePlano } from '@/hooks/usePlanos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Planos() {
  const { data: planos = [], isLoading } = usePlanos();
  const createPlano = useCreatePlano();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', descricao: '', valor: '', frequencia: '3x' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlano.mutateAsync({
        nome: form.nome,
        descricao: form.descricao || null,
        valor: Number(form.valor),
        frequencia: form.frequencia,
      });
      toast({ title: 'Plano criado!' });
      setOpen(false);
      setForm({ nome: '', descricao: '', valor: '', frequencia: '3x' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos</h1>
          <p className="text-muted-foreground">Gerencie seus planos de treino</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Plano</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Plano</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required placeholder="Ex: Plano Mensal 3x" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Detalhes do plano" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$) *</Label>
                  <Input type="number" step="0.01" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Frequência *</Label>
                  <Input value={form.frequencia} onChange={e => setForm({...form, frequencia: e.target.value})} placeholder="Ex: 3x, 5x" required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createPlano.isPending}>
                {createPlano.isPending ? 'Salvando...' : 'Criar Plano'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : planos.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum plano cadastrado. Crie seu primeiro plano!</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planos.map(plano => (
            <Card key={plano.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{plano.nome}</CardTitle>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">{plano.frequencia}/sem</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {plano.descricao && <p className="text-sm text-muted-foreground mb-4">{plano.descricao}</p>}
                <p className="text-2xl font-bold">R$ {Number(plano.valor).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
