import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Validação de Termos de Reserva (TDD)', async (t) => {
  const rootDir = process.cwd();
  const publicEventPath = path.join(rootDir, 'src/pages/PublicEventDetail.jsx');
  const receivedGiftsPath = path.join(rootDir, 'src/pages/ReceivedGifts.jsx');
  const dashboardPath = path.join(rootDir, 'src/pages/Dashboard.jsx');

  const publicEventContent = fs.readFileSync(publicEventPath, 'utf8');
  const receivedGiftsContent = fs.readFileSync(receivedGiftsPath, 'utf8');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

  await t.test('PublicEventDetail.jsx deve conter "Reservar" e "Já Reservado" em vez de "Presentear" e "Já Presenteado"', () => {
    assert.ok(publicEventContent.includes('Reservar') && !publicEventContent.includes('>Presentear<'), 'Botão principal deve ser "Reservar"');
    assert.ok(publicEventContent.includes('Já Reservado'), 'Botão desabilitado deve ser "Já Reservado"');
    assert.ok(publicEventContent.includes('Reservar: {selectedGift.nome}'), 'Título do modal deve ser "Reservar: {selectedGift.nome}"');
    assert.ok(!publicEventContent.includes('Já Presenteado'), 'Não deve conter "Já Presenteado"');
  });

  await t.test('ReceivedGifts.jsx deve conter "Presentes Reservados" no título e "Reservado" na badge de status', () => {
    assert.ok(receivedGiftsContent.includes('Presentes Reservados'), 'Título deve ser "Presentes Reservados"');
    assert.ok(receivedGiftsContent.includes('Reservado'), 'Badge de presente pendente de confirmação deve ser "Reservado"');
    assert.ok(!receivedGiftsContent.includes('Presentes Recebidos</h1>'), 'Título antigo "Presentes Recebidos</h1>" não deve existir');
  });

  await t.test('Dashboard.jsx deve conter o botão "Reservados"', () => {
    assert.ok(dashboardContent.includes('Reservados'), 'Botão de navegação deve ser "Reservados"');
  });
});
