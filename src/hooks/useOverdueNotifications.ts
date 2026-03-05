import { useEffect } from 'react';
import { usePagamentos } from './usePagamentos';
import { differenceInDays, parseISO } from 'date-fns';
import { toast } from 'sonner';

export function useOverdueNotifications() {
    const { data: pagamentos = [], isSuccess } = usePagamentos();

    useEffect(() => {
        if (!isSuccess || pagamentos.length === 0) return;

        // Check if we already notified in this session to avoid spam
        const hasNotified = sessionStorage.getItem('overdue_notified');
        if (hasNotified) return;

        const today = new Date();
        const inadimplentes = pagamentos.filter(p => {
            const venc = parseISO(p.data_vencimento);
            return p.status !== 'pago' && venc < today;
        });

        if (inadimplentes.length > 0) {
            // Obter os nomes dos alunos (removendo duplicatas caso o mesmo aluno tenha 2 pagamentos atrasados)
            const nomes = Array.from(new Set(inadimplentes.map((p: any) => p.alunos?.nome).filter(Boolean)));

            let detalhesAlunos = '';
            if (nomes.length > 0) {
                if (nomes.length <= 3) {
                    detalhesAlunos = `Alunos: ${nomes.join(', ')}`;
                } else {
                    detalhesAlunos = `Alunos: ${nomes.slice(0, 3).join(', ')} e mais ${nomes.length - 3}...`;
                }
            }

            const titulo = 'Pagamentos em Atraso Identificados';
            const corpo = `Existem ${inadimplentes.length} pagamento(s) vencido(s). ${detalhesAlunos}`;

            // Toast Notification (Interno)
            toast.error(titulo, {
                description: corpo,
                duration: 10000,
            });

            // Browser Push Notification (Externo)
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    new Notification(titulo, { body: corpo, icon: '/favicon.ico' });
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification(titulo, { body: corpo, icon: '/favicon.ico' });
                        }
                    });
                }
            }

            sessionStorage.setItem('overdue_notified', 'true');
        }
    }, [pagamentos, isSuccess]);
}
