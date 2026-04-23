export default function BottomNav({ currentView, onViewChange, isAuthenticated, tenant }) {
  if (!tenant) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t border-cream-dark shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16 px-4">
        
        {/* Item: Home / Início */}
        <button 
          onClick={() => onViewChange('home')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentView === 'home' ? 'text-gold-dark' : 'text-text-light hover:text-text-secondary'}`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${currentView === 'home' ? 'bg-gold/10' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={currentView === 'home' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={currentView === 'home' ? 0 : 2}>
              {currentView === 'home' ? (
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              )}
            </svg>
          </div>
          <span className="text-[10px] font-bold tracking-wide">Início</span>
        </button>

        {/* Item: Lista Pública */}
        <button 
          onClick={() => onViewChange('list')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentView === 'list' ? 'text-rose-gold' : 'text-text-light hover:text-text-secondary'}`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${currentView === 'list' ? 'bg-rose-gold/10' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={currentView === 'list' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={currentView === 'list' ? 0 : 2}>
              {currentView === 'list' ? (
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h3v1a2 2 0 002 2h3a2 2 0 002-2v-1h3a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              )}
            </svg>
          </div>
          <span className="text-[10px] font-bold tracking-wide">Presentes</span>
        </button>

        {/* Item: Painel (se autenticado) ou Login */}
        <button 
          onClick={() => onViewChange(isAuthenticated ? 'dashboard' : 'login')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${['dashboard', 'login', 'register'].includes(currentView) ? 'text-gold-dark' : 'text-text-light hover:text-text-secondary'}`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${['dashboard', 'login', 'register'].includes(currentView) ? 'bg-gold/10' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={['dashboard', 'login', 'register'].includes(currentView) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={['dashboard', 'login', 'register'].includes(currentView) ? 0 : 2}>
              {['dashboard', 'login', 'register'].includes(currentView) ? (
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              )}
            </svg>
          </div>
          <span className="text-[10px] font-bold tracking-wide">
            {isAuthenticated ? 'Painel' : 'Acesso'}
          </span>
        </button>
      </div>
    </div>
  );
}
