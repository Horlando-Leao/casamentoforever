import { useEffect, useState } from 'react';
import { getGifts, deleteGift } from '../services/api';
import GiftCard from '../components/GiftCard';
import GiftSkeleton from '../components/GiftSkeleton';

export default function Dashboard({ tenant, names, onLogout, onNewGift, onEditGift, onViewGift, onViewReceived }) {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
      setError(err.message || 'Falha ao carregar presentes');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/#/${tenant}/lista`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este presente?')) {
      return;
    }

    try {
      await deleteGift(tenant, id);
      setGifts(gifts.filter(g => g.id !== id));
    } catch (err) {
      setError(err.message || 'Falha ao excluir presente');
    }
  };

  return (
    <div className="min-h-screen bg-cream selection:bg-rose-gold/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-cream-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display text-text-primary flex items-center gap-2">
              <span className="text-3xl">💍</span> {formatNames()}
            </h1>
            <p className="text-sm font-bold text-text-secondary uppercase tracking-widest mt-1">Dashboard</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-bold rounded-xl border transition-all shadow-sm ${copied ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gold-dark border-gold-light/50 hover:border-gold hover:bg-gold/5'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? 'Copiado!' : 'Compartilhar Lista'}
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2.5 sm:py-2 text-sm font-bold text-text-secondary bg-gray-50 border border-gray-200 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <GiftSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Header section with Stats and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-display text-text-primary mb-1">Seus Presentes</h2>
                <p className="text-text-secondary">{gifts.length} {gifts.length === 1 ? 'item cadastrado' : 'itens cadastrados'}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                <button
                  onClick={onViewReceived}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 sm:py-3 px-6 rounded-xl transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Recebidos
                </button>
                <button
                  onClick={onNewGift}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-bold py-3.5 sm:py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novo Presente
                </button>
              </div>
            </div>

            {/* Gifts Grid */}
            {gifts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-soft border border-cream-dark">
                <div className="text-6xl mb-6 opacity-50">🎁</div>
                <h3 className="text-2xl font-display text-text-primary mb-2">Sua lista está vazia</h3>
                <p className="text-text-secondary max-w-md mx-auto mb-8">
                  Comece adicionando presentes que vocês gostariam de receber. Seus convidados verão a lista em um link exclusivo.
                </p>
                <button
                  onClick={onNewGift}
                  className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md"
                >
                  Adicionar Primeiro Presente
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {gifts.map((gift, index) => (
                  <div className="animate-fade-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }} key={gift.id}>
                    <GiftCard
                      gift={gift}
                      onView={() => onViewGift(gift.id)}
                      onEdit={() => onEditGift(gift.id)}
                      onDelete={() => handleDelete(gift.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
