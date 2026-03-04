import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pago' | 'pendente' | 'atrasado';
}

const statusConfig = {
  pago: { label: 'Pago', className: 'bg-success/15 text-success border-success/30 hover:bg-success/20' },
  pendente: { label: 'Pendente', className: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/20' },
  atrasado: { label: 'Atrasado', className: 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}
