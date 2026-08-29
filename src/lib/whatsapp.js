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

/**
 * Formata a mensagem de convite de casamento para WhatsApp.
 * @param {object} event  - Dados do evento (data_evento, horario, endereco, maps_url, dress_code)
 * @param {object} names  - { nome1, nome2 }
 * @param {string} publicUrl - Link público do convite
 */
export function formatInvitationWhatsAppMessage(event, names, publicUrl) {
  const parts = [];

  // Cabeçalho
  const nome1 = names?.nome1 ? names.nome1.charAt(0).toUpperCase() + names.nome1.slice(1).toLowerCase() : '';
  const nome2 = names?.nome2 ? names.nome2.charAt(0).toUpperCase() + names.nome2.slice(1).toLowerCase() : '';
  const coupleLabel = nome1 && nome2 ? `*${nome1} & ${nome2}*` : '*Nosso Casamento*';

  parts.push(`💍 Convite de Casamento — ${coupleLabel}`);
  parts.push('');

  // Data
  if (event?.data_evento) {
    const [year, month, day] = event.data_evento.split('-');
    const formatted = `${day}/${month}/${year}`;
    const dateObj = new Date(`${year}-${month}-${day}T12:00:00`);
    const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
    const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);

    let dateLine = `📅 *Data:* ${weekdayCapitalized}, ${formatted}`;
    if (event.horario) dateLine += ` às ${event.horario}`;
    parts.push(dateLine);
  }

  // Endereço
  if (event?.endereco) {
    parts.push(`📍 *Local:* ${event.endereco}`);
  }

  // Google Maps
  if (event?.maps_url) {
    parts.push(`🗺️ *Como chegar:* ${event.maps_url}`);
  }

  // Dress Code
  if (event?.dress_code) {
    parts.push(`👔 *Dress Code:* ${event.dress_code}`);
  }

  parts.push('');

  // Lista de presentes + link público
  parts.push(`🎁 *Lista de Presentes e Detalhes:*`);
  parts.push(publicUrl);
  parts.push('');

  // Aviso de organização
  parts.push(`⏰ _Se organize e não deixe para a última hora! Reserve um tempo na sua agenda e escolha um presente para homenagear essa data especial._ 💕`);

  return parts.join('\n');
}

/**
 * Monta a URL wa.me para compartilhar o convite (sem número — abre seleção de contato).
 */
export function buildInvitationWhatsAppUrl(event, names, publicUrl) {
  const message = formatInvitationWhatsAppMessage(event, names, publicUrl);
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

