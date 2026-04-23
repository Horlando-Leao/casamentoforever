import test from 'node:test';
import assert from 'node:assert';

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

test('Fluxo de Admin - Gerenciamento de Presentes Recebidos', async (t) => {
  const ts = Date.now();
  const testTenant = `test-admin-${ts}`;
  const testEmail = `admin-test-${ts}@example.com`;
  let token = '';
  let giftId = '';

  await t.test('Setup: Registrar usuário e criar presente', async () => {
    // Register
    const regRes = await fetch(`${API_URL}/${testTenant}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, senha: '123', nome1: 'A', nome2: 'B' })
    });
    const regData = await regRes.json();
    token = regData.token;

    // Create Gift
    const g1Res = await fetch(`${API_URL}/${testTenant}/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ nome: 'Presente Admin Test', preco: 100.00 })
    });
    const g1Data = await g1Res.json();
    giftId = g1Data.gift.id;

    // Convidado reserva o presente
    await fetch(`${API_URL}/${testTenant}/public/gifts/${giftId}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Convidado Generoso', whatsapp: '11999999999' })
    });
  });

  await t.test('Recuperar lista de presentes reservados/recebidos (Admin)', async () => {
    const res = await fetch(`${API_URL}/${testTenant}/gifts/received`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.gifts.length, 1);
    assert.strictEqual(data.gifts[0].reserved_by_name, 'Convidado Generoso');
    assert.strictEqual(data.gifts[0].status, 'reserved'); // Expected status or derived state
  });

  await t.test('Aceitar presente como recebido', async () => {
    const res = await fetch(`${API_URL}/${testTenant}/gifts/${giftId}/accept`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.gift.received_at, 'Deve ter a data de recebimento');
  });

  await t.test('Remover vinculo (desfazer reserva) do presente', async () => {
    const res = await fetch(`${API_URL}/${testTenant}/gifts/${giftId}/reservation`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    
    // Check public list to see if it is available again
    const pubRes = await fetch(`${API_URL}/${testTenant}/public/gifts`);
    const pubData = await pubRes.json();
    const g = pubData.gifts.find(g => g.id === giftId);
    assert.ok(!g.reserved, 'O presente não deve mais estar reservado');
  });
});
