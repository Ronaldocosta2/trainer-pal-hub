export function formatPhoneForWhatsApp(phone: string): string {
  // Remove tudo que não é número
  const digits = phone.replace(/\D/g, '');
  // Se já começa com 55, retorna. Senão adiciona 55
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

export function openWhatsApp(phone: string, message: string) {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
}

export function getCobrancaMessage(nomeAluno: string, valor: number, diasAtraso: number): string {
  return `Olá ${nomeAluno}! 👋\n\nEspero que esteja tudo bem! Passando para lembrar que sua mensalidade no valor de R$ ${valor.toFixed(2)} está em atraso há ${diasAtraso} dia(s).\n\nPor favor, entre em contato para regularizarmos. 💪\n\nObrigado!`;
}
