import test from 'node:test';
import assert from 'node:assert';
import { formatGiftWhatsAppMessage, buildGiftWhatsAppUrl } from '../src/lib/whatsapp.js';

test('WhatsApp Message Formatter - Presentes Recebidos', async (t) => {
  await t.test('Deve formatar a mensagem do WhatsApp com todos os detalhes do presente', () => {
    const gift = {
      id: 1,
      nome: 'Panela de Pressão Eletrica',
      preco: 350.90,
      descricao: 'Panela digital 5L inox',
      imagem_url: 'https://exemplo.com/panela.jpg',
      sites: [
        { label: 'Amazon', url: 'https://amazon.com.br/panela' },
        { label: 'Magalu', url: 'https://magalu.com.br/panela' }
      ],
      reserved_by_name: 'Maria Silva',
      reserved_by_whatsapp: '11988887777',
      reserved_at: '2026-08-26T10:00:00.000Z'
    };

    const message = formatGiftWhatsAppMessage(gift);

    assert.ok(message.includes('Maria Silva'), 'Deve incluir o nome do convidado');
    assert.ok(message.includes('Panela de Pressão Eletrica'), 'Deve incluir o nome do presente');
    assert.ok(message.includes('R$ 350,90') || message.includes('350,90'), 'Deve incluir o valor do presente');
    assert.ok(message.includes('Panela digital 5L inox'), 'Deve incluir a descrição');
    assert.ok(message.includes('Amazon: https://amazon.com.br/panela'), 'Deve incluir o link da Amazon');
    assert.ok(message.includes('Magalu: https://magalu.com.br/panela'), 'Deve incluir o link do Magalu');
    assert.ok(message.includes('https://exemplo.com/panela.jpg'), 'Deve incluir a URL da foto do presente');
  });

  await t.test('Deve construir a URL correta do WhatsApp (wa.me) com codificação', () => {
    const gift = {
      nome: 'Batedeira',
      preco: 100,
      reserved_by_name: 'João',
      reserved_by_whatsapp: '(11) 97777-6666',
      imagem_url: 'https://exemplo.com/batedeira.jpg'
    };

    const url = buildGiftWhatsAppUrl(gift);

    assert.ok(url.startsWith('https://wa.me/5511977776666?text='), 'URL deve conter o telefone limpo com ddd 55');
    assert.ok(url.includes(encodeURIComponent('João')), 'Texto codificado deve incluir João');
    assert.ok(url.includes(encodeURIComponent('https://exemplo.com/batedeira.jpg')), 'Texto codificado deve incluir imagem_url');
  });

  await t.test('Deve formatar a mensagem adequadamente quando campos opcionais não existirem', () => {
    const gift = {
      nome: 'Jogo de Copos',
      reserved_by_name: 'Ana',
      reserved_by_whatsapp: '11955554444'
    };

    const message = formatGiftWhatsAppMessage(gift);

    assert.ok(message.includes('Ana'), 'Deve incluir o nome do convidado');
    assert.ok(message.includes('Jogo de Copos'), 'Deve incluir o nome do presente');
    assert.ok(!message.includes('• *Descrição:*'), 'Não deve incluir linha de descrição se não existir');
    assert.ok(!message.includes('• *Links para compra:*'), 'Não deve incluir links se não existirem');
    assert.ok(!message.includes('• *Foto:*'), 'Não deve incluir foto se não existir');
  });
});
