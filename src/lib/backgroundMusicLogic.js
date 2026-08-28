export const PLAYLIST = [
  '/audio/track1.mp3',
  '/audio/track2.mp3',
  '/audio/track3.mp3'
];

export function getNextTrackIndex(currentIndex, totalTracks = PLAYLIST.length) {
  if (totalTracks <= 0) return 0;
  return (currentIndex + 1) % totalTracks;
}

export function toggleMuteState(currentMuted) {
  return !currentMuted;
}
