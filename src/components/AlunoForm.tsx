import { useState, useEffect } from 'react';
import { Aluno } from '@/types/database';
import { Plano } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface AlunoFormData {
  nome: string;
  telefone: string;
  email: string;
  data_nascimento: string;
  objetivo: string;
  observacoes: string;
  data_inicio: string;
  plano_id: string;
  valor_mensalidade: string;
  dia_vencimento: string;
  endereco: string;
  contato_emergencia: string;
  ativo: boolean;
  pagamento_status: 'pago' | 'pendente';
}

const emptyForm: AlunoFormData = {
  nome: '', telefone: '', email: '', data_nascimento: '',
  objetivo: '', observacoes: '', data_inicio: new Date().toISOString().split('T')[0],
  plano_id: '', valor_mensalidade: '', dia_vencimento: '10',
  endereco: '', contato_emergencia: '', ativo: true,
  pagamento_status: 'pendente',
};

interface AlunoFormProps {
  planos: Plano[];
  initialData?: Aluno | null;
  onSubmit: (data: AlunoFormData) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
}

export function AlunoForm({ planos, initialData, onSubmit, isLoading, isEdit = false }: AlunoFormProps) {
  const [form, setForm] = useState<AlunoFormData>(emptyForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.nome,
        telefone: initialData.telefone,
        email: initialData.email,
        data_nascimento: initialData.data_nascimento || '',
        objetivo: initialData.objetivo || '',
        observacoes: initialData.observacoes || '',
        data_inicio: initialData.data_inicio,
        plano_id: initialData.plano_id || '',
        valor_mensalidade: String(initialData.valor_mensalidade),
        dia_vencimento: String(initialData.dia_vencimento),
        endereco: initialData.endereco || '',
        contato_emergencia: initialData.contato_emergencia || '',
        ativo: initialData.ativo,
        pagamento_status: 'pendente',
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Nome completo *</Label>
          <Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label>Telefone (WhatsApp) *</Label>
          <Input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} required placeholder="(11) 99999-9999" />
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

        {/* Status do pagamento integrado */}
        {!isEdit && (
          <div className="space-y-2 sm:col-span-2 rounded-lg border p-4 bg-muted/30">
            <Label className="text-base font-semibold">Pagamento da 1ª mensalidade</Label>
            <div className="flex items-center gap-3 mt-2">
              <Switch
                checked={form.pagamento_status === 'pago'}
                onCheckedChange={(checked) => setForm({...form, pagamento_status: checked ? 'pago' : 'pendente'})}
              />
              <span className="text-sm">
                {form.pagamento_status === 'pago' ? '✅ Pago' : '⏳ Pendente'}
              </span>
            </div>
          </div>
        )}

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

        {isEdit && (
          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center gap-3">
              <Switch checked={form.ativo} onCheckedChange={(checked) => setForm({...form, ativo: checked})} />
              <Label>{form.ativo ? 'Aluno Ativo' : 'Aluno Inativo'}</Label>
            </div>
          </div>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Aluno'}
      </Button>
    </form>
  );
}

export type { AlunoFormData };
