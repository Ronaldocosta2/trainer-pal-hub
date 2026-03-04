import { useMemo } from 'react';
import { Users, AlertTriangle, DollarSign, CalendarClock, MessageCircle, TrendingUp } from 'lucide-react';
import { KpiCard } from '@/components/KpiCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAlunos } from '@/hooks/useAlunos';
import { usePagamentos } from '@/hooks/usePagamentos';
import { differenceInDays, parseISO, format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { openWhatsApp, getCobrancaMessage } from '@/lib/whatsapp';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, CartesianGrid } from 'recharts';

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

  // Chart data: receita dos últimos 6 meses
  const receitaMensal = useMemo(() => {
    const today = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(today, i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const receita = pagamentos
        .filter(p => {
          if (p.status !== 'pago' || !p.data_pagamento) return false;
          const dp = parseISO(p.data_pagamento);
          return isWithinInterval(dp, { start, end });
        })
        .reduce((sum, p) => sum + Number(p.valor), 0);

      months.push({
        mes: format(date, 'MMM', { locale: ptBR }),
        receita,
      });
    }
    return months;
  }, [pagamentos]);

  // Chart data: status dos pagamentos
  const statusPagamentos = useMemo(() => {
    const pagos = pagamentos.filter(p => p.status === 'pago').length;
    const pendentes = pagamentos.filter(p => p.status === 'pendente').length;
    const atrasados = pagamentos.filter(p => {
      const venc = parseISO(p.data_vencimento);
      return p.status !== 'pago' && venc < new Date();
    }).length;
    return [
      { name: 'Pagos', value: pagos, fill: 'hsl(var(--success))' },
      { name: 'Pendentes', value: pendentes - atrasados > 0 ? pendentes - atrasados : 0, fill: 'hsl(var(--warning))' },
      { name: 'Atrasados', value: atrasados, fill: 'hsl(var(--destructive))' },
    ].filter(d => d.value > 0);
  }, [pagamentos]);

  const handleCobrarWhatsApp = (pagamento: any) => {
    const nome = pagamento.alunos?.nome ?? 'Aluno';
    const telefone = pagamento.alunos?.telefone ?? '';
    const dias = differenceInDays(new Date(), parseISO(pagamento.data_vencimento));
    const msg = getCobrancaMessage(nome, Number(pagamento.valor), dias);
    openWhatsApp(telefone, msg);
  };

  const receitaChartConfig = {
    receita: { label: 'Receita', color: 'hsl(var(--primary))' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* KPIs */}
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

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {receitaMensal.every(m => m.receita === 0) ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhum dado de receita ainda</p>
            ) : (
              <ChartContainer config={receitaChartConfig} className="h-[260px] w-full">
                <AreaChart data={receitaMensal} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mes" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `R$${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorReceita)" />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" /> Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {statusPagamentos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">Nenhum pagamento registrado</p>
            ) : (
              <div className="w-full">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusPagamentos} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                        {statusPagamentos.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {statusPagamentos.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span className="text-muted-foreground">{entry.name}: <span className="font-semibold text-foreground">{entry.value}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
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
                        <Button variant="ghost" size="icon" onClick={() => handleCobrarWhatsApp(p)} title="Cobrar via WhatsApp" className="text-success hover:text-success">
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
