import { useEffect, useState } from 'react';
import { getReceivedGifts, acceptGift, removeGiftReservation } from '../services/api';
import GiftSkeleton from '../components/GiftSkeleton';

export default function ReceivedGifts({ tenant, onBack }) {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadGifts();
  }, [tenant]);

  const loadGifts = async () => {
    try {
      setLoading(true);
      const data = await getReceivedGifts(tenant);
      setGifts(data.gifts);
    } catch (err) {
      setError(err.message || 'Falha ao carregar presentes recebidos');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAccept = async (id) => {
    try {
      await acceptGift(tenant, id);
      showToast('Presente marcado como recebido!');
      setGifts(gifts.map(g => g.id === id ? { ...g, status: 'received', received_at: new Date().toISOString() } : g));
    } catch (err) {
      setError(err.message || 'Falha ao aceitar presente');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover a reserva deste presente? Ele voltará para a lista pública.')) {
      return;
    }
    try {
      await removeGiftReservation(tenant, id);
      showToast('Reserva removida com sucesso!');
      setGifts(gifts.filter(g => g.id !== id));
    } catch (err) {
      setError(err.message || 'Falha ao remover reserva');
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    // Format simple 11 digits: (99) 99999-9999
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="min-h-screen bg-cream selection:bg-rose-gold/20">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-cream-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-text-secondary hover:text-gold hover:bg-gold/5 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-display text-text-primary">Presentes Recebidos</h1>
              <p className="text-sm text-text-secondary mt-1">Gerencie os presentes escolhidos pelos convidados</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in">
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-800 text-white font-medium rounded-full shadow-xl animate-fade-in">
            {toast}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <GiftSkeleton key={i} />)}
          </div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-soft border border-cream-dark">
            <div className="text-6xl mb-6 opacity-50">🎁</div>
            <h3 className="text-2xl font-display text-text-primary mb-2">Nenhum presente reservado ainda</h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Quando os convidados escolherem os presentes, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {gifts.map((gift) => (
              <div key={gift.id} className="bg-white rounded-2xl p-6 shadow-soft border border-cream-dark flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">{gift.nome}</h3>
                    <p className="text-gold-dark font-bold text-lg">{formatCurrency(gift.preco)}</p>
                  </div>
                  {gift.status === 'received' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">
                      Recebido
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider">
                      Pendente
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-gray-700">{gift.reserved_by_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {formatPhone(gift.reserved_by_whatsapp)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(gift.reserved_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <a
                    href={`https://wa.me/55${gift.reserved_by_whatsapp?.replace(/\D/g, '')}?text=Olá ${gift.reserved_by_name}, vi que você reservou o presente ${gift.nome}!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 flex justify-center items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 rounded-lg font-bold text-sm transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.888-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    WhatsApp
                  </a>
                  {gift.status !== 'received' && (
                    <button
                      onClick={() => handleAccept(gift.id)}
                      className="flex-1 bg-gray-900 hover:bg-black text-white py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                      Recebi!
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(gift.id)}
                    className={`${gift.status === 'received' ? 'col-span-2' : 'flex-1'} bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-bold text-sm transition-colors border border-red-200`}
                  >
                    Desvincular
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
