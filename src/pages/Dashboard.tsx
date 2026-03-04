import { useMemo } from 'react';
import { Users, AlertTriangle, DollarSign, CalendarClock, MessageCircle } from 'lucide-react';
import { KpiCard } from '@/components/KpiCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAlunos } from '@/hooks/useAlunos';
import { usePagamentos } from '@/hooks/usePagamentos';
import { differenceInDays, parseISO, format } from 'date-fns';
import { openWhatsApp, getCobrancaMessage } from '@/lib/whatsapp';

export default function Dashboard() {
  const { data: alunos = [] } = useAlunos();
  const { data: pagamentos = [] } = usePagamentos();

  const stats = useMemo(() => {
    const today = new Date();
    const alunosAtivos = alunos.filter(a => a.ativo);

    const inadimplentes = pagamentos.filter(p => {
      const venc = parseISO(p.data_vencimento);
      return p.status !== 'pago' && venc < today;
    }).sort((a, b) => differenceInDays(parseISO(a.data_vencimento), parseISO(b.data_vencimento)));

    const proximosVencimentos = pagamentos.filter(p => {
      const venc = parseISO(p.data_vencimento);
      const dias = differenceInDays(venc, today);
      return p.status !== 'pago' && dias >= 0 && dias <= 7;
    });

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const receitaMes = pagamentos
      .filter(p => {
        if (p.status !== 'pago' || !p.data_pagamento) return false;
        const dp = parseISO(p.data_pagamento);
        return dp.getMonth() === currentMonth && dp.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + Number(p.valor), 0);

    return { alunosAtivos: alunosAtivos.length, inadimplentes, proximosVencimentos, receitaMes };
  }, [alunos, pagamentos]);

  const handleCobrarWhatsApp = (pagamento: any) => {
    const nome = pagamento.alunos?.nome ?? 'Aluno';
    const telefone = pagamento.alunos?.telefone ?? '';
    const dias = differenceInDays(new Date(), parseISO(pagamento.data_vencimento));
    const msg = getCobrancaMessage(nome, Number(pagamento.valor), dias);
    openWhatsApp(telefone, msg);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Alunos Ativos" value={stats.alunosAtivos} icon={Users} />
        <KpiCard title="Inadimplentes" value={stats.inadimplentes.length} icon={AlertTriangle} variant="destructive" />
        <KpiCard title="A Vencer (7 dias)" value={stats.proximosVencimentos.length} icon={CalendarClock} variant="warning" />
        <KpiCard
          title="Receita do Mês"
          value={`R$ ${stats.receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          variant="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Inadimplentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.inadimplentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum aluno inadimplente 🎉</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Atraso</TableHead>
                    <TableHead className="text-right">Cobrar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.inadimplentes.slice(0, 10).map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{(p as any).alunos?.nome ?? '—'}</TableCell>
                      <TableCell>R$ {Number(p.valor).toFixed(2)}</TableCell>
                      <TableCell className="text-destructive font-semibold">
                        {differenceInDays(new Date(), parseISO(p.data_vencimento))}d
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCobrarWhatsApp(p)}
                          title="Cobrar via WhatsApp"
                          className="text-success hover:text-success"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <CalendarClock className="h-5 w-5" /> Próximos Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.proximosVencimentos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum vencimento próximo</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.proximosVencimentos.slice(0, 5).map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{(p as any).alunos?.nome ?? '—'}</TableCell>
                      <TableCell>{format(parseISO(p.data_vencimento), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>R$ {Number(p.valor).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
