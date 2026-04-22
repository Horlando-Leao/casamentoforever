import test from 'node:test';
import assert from 'node:assert';

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

test('Fluxo de Lista de Presentes Pública', async (t) => {
  const ts = Date.now();
  const testTenant = `test-public-${ts}`;
  const testEmail = `guest-test-${ts}@example.com`;
  let token = '';
  let gift1Id = '';
  let gift2Id = '';

  await t.test('Setup: Registrar usuário e criar presentes', async () => {
    // Register
    const regRes = await fetch(`${API_URL}/${testTenant}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, senha: '123', nome1: 'A', nome2: 'B' })
    });
    const regData = await regRes.json();
    token = regData.token;
    assert.ok(token, 'Deve retornar token');

    // Create Gift 1
    const g1Res = await fetch(`${API_URL}/${testTenant}/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ nome: 'Presente 1', chave_pix: 'pix1@exemplo.com', preco: 150.50 })
    });
    const g1Data = await g1Res.json();
    gift1Id = g1Data.gift.id;

    // Create Gift 2
    const g2Res = await fetch(`${API_URL}/${testTenant}/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ nome: 'Presente 2', chave_pix: 'pix2@exemplo.com', preco: 200.00 })
    });
    const g2Data = await g2Res.json();
    gift2Id = g2Data.gift.id;
  });

  await t.test('Recuperar lista pública de presentes', async () => {
    const res = await fetch(`${API_URL}/${testTenant}/public/gifts`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.gifts.length, 2);
    const g1 = data.gifts.find(g => g.id === gift1Id);
    assert.strictEqual(g1.chave_pix, 'pix1@exemplo.com');
    assert.strictEqual(Number(g1.preco), 150.50);
  });

  await t.test('Reservar presente 1', async () => {
    const res = await fetch(`${API_URL}/${testTenant}/public/gifts/${gift1Id}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Convidado Teste', whatsapp: '11999999999' })
    });
    assert.strictEqual(res.status, 200, 'Reserva deve ter sucesso');
    const data = await res.json();
    assert.strictEqual(data.gift.chave_pix, 'pix1@exemplo.com', 'A resposta da reserva deve incluir o PIX para o pagador');
  });

  await t.test('Tentar reservar presente já reservado deve falhar (409)', async () => {
    const res = await fetch(`${API_URL}/${testTenant}/public/gifts/${gift1Id}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Outro Convidado', whatsapp: '11888888888' })
    });
    assert.strictEqual(res.status, 409);
  });

  await t.test('Tentar reservar segundo presente com mesmo WhatsApp deve falhar (403)', async () => {
    const res = await fetch(`${API_URL}/${testTenant}/public/gifts/${gift2Id}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Convidado Teste', whatsapp: '11999999999' })
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('Lista pública deve ocultar PIX de presentes reservados', async () => {
    const res = await fetch(`${API_URL}/${testTenant}/public/gifts`);
    const data = await res.json();
    const g1 = data.gifts.find(g => g.id === gift1Id);
    
    assert.ok(g1.reserved, 'Presente 1 deve estar marcado como reserved');
    assert.ok(!g1.chave_pix, 'Chave PIX do Presente 1 deve ser ocultada');
  });
});
