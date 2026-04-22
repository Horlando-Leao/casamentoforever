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
    <div className="mt-4 relative group">
      <div className="p-4 bg-cream rounded-lg border border-gold border-opacity-20 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded">
            <p className="text-gray-500 text-center text-sm">
              Imagem não encontrada ou URL inválida
            </p>
          </div>
        ) : (
          <div className="relative w-full h-48 flex items-center justify-center">
            <img
              src={url}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
            {loaded && (
              <button
                type="button"
                onClick={() => setShowFullImage(true)}
                className="absolute top-0 right-0 p-1.5 bg-white/80 hover:bg-white text-rose-gold rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                title="Visualizar tamanho real"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setShowFullImage(false)}
        >
          <img 
            src={url} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain shadow-2xl" 
          />
          <button className="absolute top-4 right-4 text-white text-4xl">&times;</button>
        </div>
      )}
    </div>
  );
}
