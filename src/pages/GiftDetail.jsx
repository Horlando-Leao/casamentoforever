import { useEffect, useState } from 'react';
import { getGift, deleteGift } from '../services/api';

export default function GiftDetail({ tenant, giftId, onEdit, onDelete, onBack }) {
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadGift();
  }, [giftId, tenant]);

  const loadGift = async () => {
    try {
      const data = await getGift(tenant, giftId);
      setGift(data.gift);
    } catch (err) {
      setError(err.message || 'Failed to load gift');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this gift?')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteGift(tenant, giftId);
      onDelete();
    } catch (err) {
      setError(err.message || 'Failed to delete gift');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Gift not found</p>
          <button
            onClick={onBack}
            className="text-gold font-semibold hover:text-rose-gold"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Truncate PIX key for display
  const displayPix = gift.chave_pix
    ? gift.chave_pix.length > 20
      ? gift.chave_pix.substring(0, 17) + '...'
      : gift.chave_pix
    : null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-gold border-opacity-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="text-gold font-semibold hover:text-rose-gold mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-display text-rose-gold">{gift.nome}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image */}
          {gift.imagem_url && (
            <div className="w-full h-96 bg-cream overflow-hidden">
              <img
                src={gift.imagem_url}
                alt={gift.nome}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Details */}
          <div className="p-8">
            {/* PIX */}
            {displayPix && (
              <div className="mb-6 p-4 bg-gold/10 rounded-lg border border-gold border-opacity-30">
                <p className="text-sm text-gray-600 mb-1">PIX Key</p>
                <p className="text-lg font-semibold text-rose-gold font-mono">{displayPix}</p>
              </div>
            )}

            {/* Shopping Sites */}
            {gift.sites && gift.sites.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Where to Buy</h2>
                <div className="grid grid-cols-1 gap-3">
                  {gift.sites.map((site, index) => (
                    <a
                      key={index}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 border border-gold border-opacity-20 rounded-lg hover:bg-cream transition flex items-center justify-between"
                    >
                      <span className="font-semibold text-gray-800">{site.label}</span>
                      <span className="text-gold">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div className="pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
              <p>Created: {new Date(gift.created_at).toLocaleDateString()}</p>
              {gift.updated_at && (
                <p>Updated: {new Date(gift.updated_at).toLocaleDateString()}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={onEdit}
                className="flex-1 px-6 py-2 bg-gold hover:bg-gold/90 text-white font-semibold rounded-lg transition"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
