export function formatCurrency(value) {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatGiftWhatsAppMessage(gift) {
  const parts = [];
  const guestName = gift.reserved_by_name || 'Convidado';
  
  parts.push(`Olá ${guestName}! Obrigado por reservar o presente *${gift.nome}*! 🎁`);
  parts.push('');
  parts.push(`ℹ️ *Detalhes do Presente:*`);
  parts.push(`• *Presente:* ${gift.nome}`);
  
  if (gift.preco) {
    parts.push(`• *Valor:* ${formatCurrency(gift.preco)}`);
  }
  
  if (gift.descricao) {
    parts.push(`• *Descrição:* ${gift.descricao}`);
  }
  
  if (gift.sites && Array.isArray(gift.sites) && gift.sites.length > 0) {
    const validSites = gift.sites.filter(s => s.url);
    if (validSites.length > 0) {
      parts.push(`• *Links para compra:*`);
      validSites.forEach(s => {
        const label = s.label ? `${s.label}: ` : '';
        parts.push(`  - ${label}${s.url}`);
      });
    }
  }
  
  if (gift.imagem_url) {
    parts.push(`• *Foto:* ${gift.imagem_url}`);
  }
  
  parts.push('');
  parts.push(`Qualquer dúvida, estamos à disposição! 💕`);
  
  return parts.join('\n');
}

export function buildGiftWhatsAppUrl(gift) {
  const rawPhone = gift.reserved_by_whatsapp ? String(gift.reserved_by_whatsapp).replace(/\D/g, '') : '';
  const phone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
  const message = formatGiftWhatsAppMessage(gift);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
