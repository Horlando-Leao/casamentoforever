import test from 'node:test';
import assert from 'node:assert';

// Simulating the logic from the component
function calculateCountdown(date, time, now) {
  if (!date) return null;
  
  const eventDate = new Date(`${date}T${time || '00:00'}:00`);
  const diff = eventDate - now;

  if (diff <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

test('Countdown Logic', async (t) => {
  await t.test('Deve calcular corretamente mais de 1 dia restante', () => {
    const now = new Date('2026-04-20T10:00:00');
    const eventDate = '2026-04-23';
    const eventTime = '19:00';
    
    const result = calculateCountdown(eventDate, eventTime, now);
    assert.strictEqual(result.days, 3);
    assert.strictEqual(result.hours, 9);
  });

  await t.test('Deve calcular corretamente menos de 1 dia restante (horas)', () => {
    const now = new Date('2026-04-23T10:00:00');
    const eventDate = '2026-04-23';
    const eventTime = '19:00';
    
    const result = calculateCountdown(eventDate, eventTime, now);
    assert.strictEqual(result.days, 0);
    assert.strictEqual(result.hours, 9);
  });

  await t.test('Deve retornar total 0 se a data já passou', () => {
    const now = new Date('2026-04-24T10:00:00');
    const eventDate = '2026-04-23';
    const eventTime = '19:00';
    
    const result = calculateCountdown(eventDate, eventTime, now);
    assert.strictEqual(result.total, 0);
  });
});
