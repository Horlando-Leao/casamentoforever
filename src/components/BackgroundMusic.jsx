import { useState, useRef, useEffect } from 'react';
import { PLAYLIST, getNextTrackIndex, toggleMuteState, handlePromptChoice } from '../lib/backgroundMusicLogic';

export default function BackgroundMusic() {
  const [isMuted, setIsMuted] = useState(true);
  const [showPrompt, setShowPrompt] = useState(true);
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

  const startPlaying = () => {
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
  };

  // Lazy initialize and play/pause audio
  const handleToggleMute = () => {
    setShowPrompt(false);
    const nextMuteState = toggleMuteState(isMuted);
    setIsMuted(nextMuteState);

    if (!nextMuteState) {
      startPlaying();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // Handle user response from pop-up modal/toast
  const handlePromptResponse = (accepted) => {
    const result = handlePromptChoice(accepted);
    setShowPrompt(result.showPrompt);
    setIsMuted(result.isMuted);

    if (accepted) {
      startPlaying();
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
    <>
      {/* Pop-up de permissão/convite de música */}
      {showPrompt && (
        <div className="fixed bottom-24 right-4 sm:bottom-20 sm:right-6 z-50 animate-slide-up-sheet sm:animate-fade-in max-w-xs sm:max-w-sm w-full bg-white/95 backdrop-blur-xl border border-cream-dark shadow-2xl p-5 rounded-2xl">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎶</span>
              <h3 className="text-sm font-bold text-text-primary">Música de Fundo</h3>
            </div>
            <button
              onClick={() => handlePromptResponse(false)}
              className="text-text-light hover:text-text-primary text-sm p-1 transition-colors"
              title="Fechar"
              aria-label="Fechar mensagem"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed mb-4">
            Deseja ouvir uma música agradável enquanto escolhe os presentes para os noivos? ✨
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePromptResponse(true)}
              className="flex-1 py-2.5 px-3 bg-gold hover:bg-gold-dark text-white text-xs font-bold rounded-xl shadow-md shadow-gold/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              Sim, tocar música 🎵
            </button>
            <button
              onClick={() => handlePromptResponse(false)}
              className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-text-secondary text-xs font-semibold rounded-xl transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      {/* Botão Flutuante Mute / Unmute */}
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
    </>
  );
}
