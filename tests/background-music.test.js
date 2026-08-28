import test from 'node:test';
import assert from 'node:assert';

// Import/Simulate the sequential playlist logic from BackgroundMusic component
import { PLAYLIST, getNextTrackIndex, toggleMuteState } from '../src/lib/backgroundMusicLogic.js';

test('Lógica do Player de Música de Fundo', async (t) => {
  await t.test('Deve conter exatamente 3 faixas padrão locais', () => {
    assert.strictEqual(PLAYLIST.length, 3, 'A playlist deve ter 3 músicas');
    assert.strictEqual(PLAYLIST[0], '/audio/track1.mp3');
    assert.strictEqual(PLAYLIST[1], '/audio/track2.mp3');
    assert.strictEqual(PLAYLIST[2], '/audio/track3.mp3');
  });

  await t.test('Deve avançar as faixas sequencialmente em loop (0 -> 1 -> 2 -> 0)', () => {
    assert.strictEqual(getNextTrackIndex(0, PLAYLIST.length), 1, 'Faixa 0 avança para 1');
    assert.strictEqual(getNextTrackIndex(1, PLAYLIST.length), 2, 'Faixa 1 avança para 2');
    assert.strictEqual(getNextTrackIndex(2, PLAYLIST.length), 0, 'Faixa 2 reinicia para 0');
  });

  await t.test('Deve alternar corretamente o estado de mute', () => {
    assert.strictEqual(toggleMuteState(true), false, 'Desmutar');
    assert.strictEqual(toggleMuteState(false), true, 'Mutar');
  });
});
