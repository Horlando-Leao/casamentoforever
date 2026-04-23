import { useEffect, useState } from 'react';

export default function ImagePreview({ url }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [url]);

  if (!url) return null;

  return (
    <div className="mt-4 relative group animate-fade-in">
      <div className="p-4 bg-cream-alt rounded-2xl border-2 border-dashed border-gold-light/50 flex items-center justify-center overflow-hidden transition-colors hover:border-gold-light">
        {error ? (
          <div className="w-full h-48 flex flex-col items-center justify-center bg-gray-50/50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-light mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-text-secondary text-center text-sm font-medium">
              Não foi possível carregar a imagem
            </p>
          </div>
        ) : (
          <div className="relative w-full h-48 flex items-center justify-center">
            <img
              src={url}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-xl shadow-sm"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
            {loaded && (
              <button
                type="button"
                onClick={() => setShowFullImage(true)}
                className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-gold-dark rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                title="Visualizar em tela cheia"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setShowFullImage(false)}
        >
          <img 
            src={url} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" 
          />
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
