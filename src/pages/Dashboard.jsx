import { useEffect, useState, useRef } from 'react';
import { getGifts, deleteGift, getEventDetails } from '../services/api';
import GiftCard from '../components/GiftCard';
import GiftSkeleton from '../components/GiftSkeleton';
import Countdown from '../components/Countdown';

export default function Dashboard({ tenant, names, onLogout, onNewGift, onEditGift, onViewGift, onViewReceived, onViewEvent, onShareInvitation, onShareInvitationWhatsApp, showModal }) {
  const [gifts, setGifts] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const shareDropdownRef = useRef(null);

  // Format names as "Nome1 & Nome2" with first letter capitalized
  const formatNames = () => {
    if (!names?.nome1 || !names?.nome2) return tenant;
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    return `${capitalize(names.nome1)} & ${capitalize(names.nome2)}`;
  };

  useEffect(() => {
    loadData();
  }, [tenant]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(e.target)) {
        setShareDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [giftsData, eventData] = await Promise.all([
        getGifts(tenant),
        getEventDetails(tenant).catch(() => ({ event: null }))
      ]);
      setGifts(giftsData.gifts);
      setEvent(eventData.event);
    } catch (err) {
      setError(err.message || 'Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    showModal({
      title: 'Excluir Presente?',
      message: 'Tem certeza que deseja excluir este presente? Esta ação não pode ser desfeita.',
      confirmLabel: 'Sim, Excluir',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        try {
          await deleteGift(tenant, id);
          setGifts(gifts.filter(g => g.id !== id));
        } catch (err) {
          setError(err.message || 'Falha ao excluir presente');
        }
      }
    });
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
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Dashboard</p>
              {event?.data_evento && (
                <Countdown date={event.data_evento} time={event.horario} />
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Split button: Compartilhar Convite */}
            <div ref={shareDropdownRef} className="relative flex-1 sm:flex-none">
              <div className="flex rounded-xl border border-gold-light/50 bg-white shadow-sm overflow-hidden">
                {/* Botão principal — copia o link */}
                <button
                  id="btn-share-copy-link"
                  onClick={onShareInvitation}
                  className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-bold text-gold-dark hover:bg-gold/5 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartilhar Convite
                </button>
                {/* Seta para dropdown */}
                <button
                  id="btn-share-dropdown-toggle"
                  onClick={() => setShareDropdownOpen(v => !v)}
                  aria-label="Mais opções de compartilhamento"
                  aria-expanded={shareDropdownOpen}
                  className="px-2.5 py-2.5 sm:py-2 border-l border-gold-light/50 text-gold-dark hover:bg-gold/5 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${shareDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Dropdown */}
              {shareDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-cream-dark z-50 overflow-hidden animate-fade-in">
                  <button
                    id="btn-share-whatsapp"
                    onClick={() => {
                      setShareDropdownOpen(false);
                      onShareInvitationWhatsApp?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-primary hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    {/* WhatsApp icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Enviar via WhatsApp
                  </button>
                </div>
              )}
            </div>
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
                  onClick={onViewEvent}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 sm:py-3 px-6 rounded-xl transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Convite
                </button>
                <button
                  onClick={onViewReceived}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 sm:py-3 px-6 rounded-xl transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Reservados
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
