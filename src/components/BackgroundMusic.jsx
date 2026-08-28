import { useState, useRef, useEffect } from 'react';
import { PLAYLIST, getNextTrackIndex, toggleMuteState } from '../lib/backgroundMusicLogic';

export default function BackgroundMusic() {
  const [isMuted, setIsMuted] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Lazy initialize and play/pause audio
  const handleToggleMute = () => {
    const nextMuteState = toggleMuteState(isMuted);
    setIsMuted(nextMuteState);

    if (!nextMuteState) {
      // Un-muting: Lazy initialize Audio object if not created yet
      if (!audioRef.current) {
        const audio = new Audio(PLAYLIST[currentTrackIndex]);
        audio.volume = 0.6;
        
        audio.onended = () => {
          handleNextTrack();
        };

        audioRef.current = audio;
      }

      audioRef.current.play().catch(err => {
        console.log('Autoplay prevented or playback error:', err);
      });
    } else {
      // Muting
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // Sequential track transition on song end
  const handleNextTrack = () => {
    const nextIndex = getNextTrackIndex(currentTrackIndex, PLAYLIST.length);
    setCurrentTrackIndex(nextIndex);

    if (audioRef.current) {
      audioRef.current.src = PLAYLIST[nextIndex];
      audioRef.current.play().catch(err => {
        console.log('Error playing next track:', err);
      });
    }
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
      <button
        onClick={handleToggleMute}
        title={isMuted ? 'Tocar música de fundo' : 'Silenciar música'}
        aria-label={isMuted ? 'Ativar som de fundo' : 'Silenciar som de fundo'}
        className={`group flex items-center gap-2.5 px-4 py-3 rounded-full backdrop-blur-md shadow-floating border transition-all duration-300 ${
          isMuted
            ? 'bg-white/90 border-cream-dark text-text-secondary hover:text-text-primary hover:border-gold-light'
            : 'bg-gradient-to-r from-white/95 to-cream-alt/95 border-gold/40 text-gold-dark ring-2 ring-gold/20 shadow-gold/10'
        }`}
      >
        {/* Equalizer animation when active */}
        {!isMuted && (
          <div className="flex items-end gap-0.5 h-4 px-0.5">
            <span className="w-0.5 bg-gold-dark rounded-full animate-[bounce_1s_infinite_100ms] h-full"></span>
            <span className="w-0.5 bg-gold-dark rounded-full animate-[bounce_1s_infinite_300ms] h-2"></span>
            <span className="w-0.5 bg-gold-dark rounded-full animate-[bounce_1s_infinite_200ms] h-3.5"></span>
          </div>
        )}

        {/* Audio Icon (Speaker with waves / Speaker Muted) */}
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}

        <span className="text-xs font-bold tracking-wide">
          {isMuted ? 'Música' : 'Tocando'}
        </span>
      </button>
    </div>
  );
}
