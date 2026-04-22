import { useEffect, useState } from 'react';

export default function ImagePreview({ url }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [url]);

  if (!url) return null;

  return (
    <div className="mt-4 p-4 bg-cream rounded-lg border border-gold border-opacity-20">
      {error ? (
        <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded">
          <p className="text-gray-500 text-center">
            Image not found or invalid URL
          </p>
        </div>
      ) : (
        <img
          src={url}
          alt="Preview"
          className="w-full h-48 object-cover rounded"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
