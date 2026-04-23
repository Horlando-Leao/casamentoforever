import { useEffect, useState } from 'react';
import { getPublicGifts, reserveGift } from '../services/api';
import GiftSkeleton from '../components/GiftSkeleton';

export default function PublicGiftList({ tenant }) {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal de reserva
  const [selectedGift, setSelectedGift] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestWhatsapp, setGuestWhatsapp] = useState('');
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState('');
  
  // Modal de sucesso (com os dados de pagamento)
  const [successGift, setSuccessGift] = useState(null);

  useEffect(() => {
    loadGifts();
  }, [tenant]);

  const loadGifts = async () => {
    try {
      setLoading(true);
      const data = await getPublicGifts(tenant);
      setGifts(data.gifts);
    } catch (err) {
      setError(err.message || 'Falha ao carregar lista de presentes.');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveClick = (gift) => {
    if (gift.reserved) return;
    setSelectedGift(gift);
    setGuestName('');
    setGuestWhatsapp('');
    setReserveError('');
  };

  const submitReserve = async (e) => {
    e.preventDefault();
    if (!guestName || !guestWhatsapp) {
      setReserveError('Preencha nome e WhatsApp.');
      return;
    }
    
    setReserving(true);
    setReserveError('');
    try {
      const data = await reserveGift(tenant, selectedGift.id, guestName, guestWhatsapp);
      // Sucesso!
      setSelectedGift(null);
      setSuccessGift(data.gift); // Tem os detalhes (PIX, links)
      
      // Atualizar lista localmente marcando como reservado
      setGifts(gifts.map(g => g.id === data.gift.id ? { ...g, reserved: true } : g));
    } catch (err) {
      setReserveError(err.message || 'Falha ao reservar presente.');
    } finally {
      setReserving(false);
    }
  };

  const closeSuccess = () => {
    setSuccessGift(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <header className="relative bg-white overflow-hidden border-b border-cream-dark">
          <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
            <div className="h-4 bg-gray-200 rounded-full w-24 mx-auto mb-6 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg w-64 mx-auto mb-6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-full w-full max-w-md mx-auto animate-pulse"></div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <GiftSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream selection:bg-rose-gold/20">
      {/* Hero Section */}
      <header className="relative bg-white overflow-hidden border-b border-cream-dark">
        <div className="absolute inset-0 bg-gradient-to-b from-cream-alt to-transparent opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-cream-dark text-gold-dark text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
            Nossa Lista
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display text-text-primary mb-6 leading-tight">
            Lista de <span className="text-rose-gold italic">Presentes</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary font-light max-w-2xl mx-auto leading-relaxed">
            Escolha um presente para os noivos com muito carinho! Sua contribuição nos ajudará a construir nosso lar e realizar nossos sonhos.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8 relative z-10">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-center shadow-soft animate-fade-in flex items-center justify-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {gifts.length === 0 && !error ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-soft border border-cream-dark max-w-2xl mx-auto">
            <div className="text-6xl mb-6 opacity-50">🎁</div>
            <h3 className="text-2xl font-display text-text-primary mb-2">Lista Vazia</h3>
            <p className="text-text-secondary">Os noivos ainda não adicionaram presentes a esta lista.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {gifts.map((gift, index) => (
              <div 
                key={gift.id} 
                className={`bg-white rounded-2xl shadow-soft border border-cream-dark overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-floating flex flex-col h-full animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <div className={`relative w-full aspect-[4/3] bg-cream-alt flex items-center justify-center overflow-hidden ${gift.reserved ? 'grayscale opacity-75' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-cream-dark/30 to-transparent z-0"></div>
                  {gift.imagem_url ? (
                    <img
                      src={gift.imagem_url}
                      alt={gift.nome}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 relative z-10"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl relative z-10 opacity-70">
                      💝
                    </div>
                  )}
                  
                  {gift.reserved && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-500 shadow-sm z-20 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      RESERVADO
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-display font-semibold text-text-primary mb-2 line-clamp-2" title={gift.nome}>
                    {gift.nome}
                  </h3>
                  
                  <div className="flex-grow"></div>
                  
                  {gift.preco && (
                    <p className="text-gold-dark font-bold text-xl mb-5">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gift.preco)}
                    </p>
                  )}
                  
                  {gift.reserved ? (
                    <button disabled className="w-full py-3.5 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed border border-gray-200 transition-colors">
                      Já Presenteado
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleReserveClick(gift)}
                      className="w-full py-3.5 bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl shadow-md shadow-gold/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Presentear
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Reserva / Bottom Sheet */}
      {selectedGift && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100] animate-fade-in">
          <div 
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-slide-up-sheet sm:animate-fade-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle para mobile */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            
            <h2 className="text-2xl font-display text-text-primary mb-4 pr-8">Presentear: {selectedGift.nome}</h2>
            <button 
              onClick={() => setSelectedGift(null)}
              className="absolute top-6 right-6 text-text-light hover:text-text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <p className="text-sm text-text-secondary mb-8 leading-relaxed">
              Para reservar este presente, precisamos de alguns dados. Assim garantimos que o presente seja único!
            </p>
            
            {reserveError && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {reserveError}
            </div>}
            
            <form onSubmit={submitReserve} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-cream-dark rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold outline-none transition-all text-lg"
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={guestWhatsapp}
                  onChange={e => setGuestWhatsapp(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-cream-dark rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold outline-none transition-all text-lg"
                  placeholder="Ex: 11999999999"
                />
              </div>
              
              <div className="flex gap-3 pt-4 pb-20 sm:pb-safe">
                <button
                  type="submit"
                  disabled={reserving}
                  className="w-full py-4 bg-gold hover:bg-gold-dark text-white rounded-xl font-bold text-lg shadow-md shadow-gold/20 transition-all disabled:opacity-50"
                >
                  {reserving ? 'Reservando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Sucesso / Bottom Sheet */}
      {successGift && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-10 animate-slide-up-sheet sm:animate-fade-in text-center relative">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 sm:hidden"></div>
            
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-display text-text-primary mb-3">Muito Obrigado!</h2>
            <p className="text-text-secondary mb-8 text-lg">
              Você acabou de reservar <strong>{successGift.nome}</strong> para os noivos!
            </p>

            <div className="bg-cream-alt p-6 rounded-2xl mb-8 text-left border border-gold-light/30 shadow-inner">
              <h4 className="font-bold text-text-primary mb-4 text-center uppercase tracking-widest text-xs">Instruções para o Presente</h4>
              
              {successGift.chave_pix ? (
                <div className="mb-6">
                  <p className="text-xs font-bold text-text-secondary mb-2 uppercase">Chave PIX</p>
                  <div className="bg-white p-4 rounded-xl border border-cream-dark font-mono text-text-primary text-sm break-all flex justify-between items-center shadow-sm">
                    <span className="mr-4">{successGift.chave_pix}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(successGift.chave_pix)}
                      className="shrink-0 px-3 py-1.5 bg-gold/10 text-gold-dark text-xs font-bold rounded-lg hover:bg-gold/20 transition-colors"
                    >
                      COPIAR
                    </button>
                  </div>
                </div>
              ) : null}

              {successGift.sites && successGift.sites.length > 0 ? (
                <div>
                  <p className="text-xs font-bold text-text-secondary mb-3 uppercase">Onde Comprar</p>
                  <div className="space-y-3">
                    {successGift.sites.map((site, i) => (
                      <a 
                        key={i} 
                        href={site.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 bg-white border border-gold-light/40 text-text-primary rounded-xl hover:border-gold hover:shadow-md transition-all group"
                      >
                        <span className="font-semibold">{site.label}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-light group-hover:text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {!successGift.chave_pix && (!successGift.sites || successGift.sites.length === 0) && (
                <div className="py-4 text-center">
                  <p className="text-sm text-text-light italic">
                    O casal não forneceu instruções automáticas.<br/>Por favor, entre em contato com eles!
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={closeSuccess}
              className="w-full py-4 bg-gold hover:bg-gold-dark text-white rounded-xl font-bold text-lg shadow-md shadow-gold/20 transition-all pb-safe mb-20 sm:mb-0"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
