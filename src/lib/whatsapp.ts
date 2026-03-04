import { toast } from 'sonner';

export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

export function openWhatsApp(phone: string, message: string) {
  const url = getWhatsAppUrl(phone, message);
  const win = window.open(url, '_blank');
  
  // If blocked by iframe/popup blocker, copy link to clipboard
  if (!win || win.closed) {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link do WhatsApp copiado!', {
        description: 'Cole no navegador para abrir a conversa.',
      });
    }).catch(() => {
      // Fallback: show the URL in a toast
      toast.info('Abra este link no navegador:', {
        description: url,
        duration: 10000,
      });
    });
  }
}

export function getCobrancaMessage(nomeAluno: string, valor: number, diasAtraso: number): string {
  return `Olá ${nomeAluno}! 👋\n\nEspero que esteja tudo bem! Passando para lembrar que sua mensalidade no valor de R$ ${valor.toFixed(2)} está em atraso há ${diasAtraso} dia(s).\n\nPor favor, entre em contato para regularizarmos. 💪\n\nObrigado!`;
}
