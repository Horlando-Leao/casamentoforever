import { useEffect, useState } from 'react';
import { getGifts, deleteGift } from '../services/api';
import GiftCard from '../components/GiftCard';

export default function Dashboard({ tenant, names, onLogout, onNewGift, onEditGift, onViewGift }) {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Format names as "Nome1 & Nome2" with first letter capitalized
  const formatNames = () => {
    if (!names?.nome1 || !names?.nome2) return tenant;
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    return `${capitalize(names.nome1)} & ${capitalize(names.nome2)}`;
  };

  useEffect(() => {
    loadGifts();
  }, [tenant]);

  const loadGifts = async () => {
    try {
      setLoading(true);
      const data = await getGifts(tenant);
      setGifts(data.gifts);
    } catch (err) {
      setError(err.message || 'Failed to load gifts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gift?')) {
      return;
    }

    try {
      await deleteGift(tenant, id);
      setGifts(gifts.filter(g => g.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete gift');
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-gold border-opacity-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display text-rose-gold">💍 {formatNames()}</h1>
            <p className="text-sm text-gray-600">Your gift registry</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-gold font-semibold hover:text-rose-gold"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading gifts...</p>
          </div>
        ) : (
          <>
            {/* New Gift Button */}
            <div className="mb-8 flex justify-end">
              <button
                onClick={onNewGift}
                className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                ＋ New Gift
              </button>
            </div>

            {/* Gifts Grid */}
            {gifts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-gray-600 mb-6">No gifts yet</p>
                <button
                  onClick={onNewGift}
                  className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Create your first gift
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gifts.map(gift => (
                  <GiftCard
                    key={gift.id}
                    gift={gift}
                    onView={() => onViewGift(gift.id)}
                    onEdit={() => onEditGift(gift.id)}
                    onDelete={() => handleDelete(gift.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
