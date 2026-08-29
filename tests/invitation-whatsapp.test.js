import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatInvitationWhatsAppMessage, buildInvitationWhatsAppUrl } from '../src/lib/whatsapp.js';

describe('formatInvitationWhatsAppMessage', () => {
  const baseEvent = {
    data_evento: '2026-12-05',
    horario: '16:00',
    endereco: 'Rua das Flores, 100 - Centro, São Paulo/SP',
    maps_url: 'https://maps.google.com/?q=test',
    dress_code: 'Esporte Fino',
  };

  const baseNames = { nome1: 'Ana', nome2: 'Carlos' };
  const publicUrl = 'https://casamentoforever.com/#/convite/abc123';

  it('deve incluir os nomes dos noivos', () => {
    const msg = formatInvitationWhatsAppMessage(baseEvent, baseNames, publicUrl);
    assert.ok(msg.includes('Ana') && msg.includes('Carlos'));
  });

  it('deve incluir a data do casamento formatada', () => {
    const msg = formatInvitationWhatsAppMessage(baseEvent, baseNames, publicUrl);
    // 05/12/2026
    assert.ok(msg.includes('05/12/2026'));
  });

  it('deve incluir o endereço', () => {
    const msg = formatInvitationWhatsAppMessage(baseEvent, baseNames, publicUrl);
    assert.ok(msg.includes('Rua das Flores'));
  });

  it('deve incluir o link do Google Maps quando disponível', () => {
    const msg = formatInvitationWhatsAppMessage(baseEvent, baseNames, publicUrl);
    assert.ok(msg.includes('maps.google.com'));
  });

  it('deve incluir o link público do convite', () => {
    const msg = formatInvitationWhatsAppMessage(baseEvent, baseNames, publicUrl);
    assert.ok(msg.includes(publicUrl));
  });

  it('deve incluir o aviso de organização', () => {
    const msg = formatInvitationWhatsAppMessage(baseEvent, baseNames, publicUrl);
    assert.ok(msg.toLowerCase().includes('última hora'));
  });

  it('deve incluir o dress code quando disponível', () => {
    const msg = formatInvitationWhatsAppMessage(baseEvent, baseNames, publicUrl);
    assert.ok(msg.includes('Esporte Fino'));
  });

  it('deve omitir maps_url quando não cadastrado', () => {
    const event = { ...baseEvent, maps_url: null };
    const msg = formatInvitationWhatsAppMessage(event, baseNames, publicUrl);
    assert.ok(!msg.includes('maps.google.com'));
  });

  it('deve omitir dress_code quando não cadastrado', () => {
    const event = { ...baseEvent, dress_code: null };
    const msg = formatInvitationWhatsAppMessage(event, baseNames, publicUrl);
    assert.ok(!msg.toLowerCase().includes('dress code'));
  });

  it('deve omitir horário quando não cadastrado', () => {
    const event = { ...baseEvent, horario: null };
    const msg = formatInvitationWhatsAppMessage(event, baseNames, publicUrl);
    assert.ok(!msg.includes('16:00'));
  });
});

describe('buildInvitationWhatsAppUrl', () => {
  it('deve retornar uma URL wa.me válida', () => {
    const event = { data_evento: '2026-12-05', endereco: 'Rua X', horario: '16:00' };
    const url = buildInvitationWhatsAppUrl(event, { nome1: 'Ana', nome2: 'Carlos' }, 'https://site.com/#/convite/abc');
    assert.ok(url.startsWith('https://wa.me/?text='));
  });

  it('deve codificar a mensagem na URL', () => {
    const event = { data_evento: '2026-12-05', endereco: 'Rua X', horario: '16:00' };
    const url = buildInvitationWhatsAppUrl(event, { nome1: 'Ana', nome2: 'Carlos' }, 'https://site.com/#/convite/abc');
    assert.ok(url.includes('%'));
  });
});
