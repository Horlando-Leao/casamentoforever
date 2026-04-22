import { useEffect, useState } from 'react';
import { getPublicGifts, reserveGift } from '../services/api';

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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-600">Carregando lista de presentes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-gold border-opacity-20 shadow-sm text-center py-8">
        <h1 className="text-4xl font-display text-rose-gold mb-2">Lista de Presentes</h1>
        <p className="text-gray-600">Escolha um presente para os noivos com muito carinho!</p>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">{error}</div>}

        {gifts.length === 0 && !error ? (
          <div className="text-center py-12 text-gray-500">
            A lista de presentes ainda está vazia.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map(gift => (
              <div 
                key={gift.id} 
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition ${gift.reserved ? 'opacity-60 grayscale-[50%]' : 'hover:shadow-xl'}`}
              >
                <div className="w-full h-48 bg-cream overflow-hidden">
                  {gift.imagem_url ? (
                    <img
                      src={gift.imagem_url}
                      alt={gift.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      💝
                    </div>
                  )}
                </div>
                
                <div className="p-5 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 truncate" title={gift.nome}>
                    {gift.nome}
                  </h3>
                  
                  {gift.reserved ? (
                    <button disabled className="w-full py-3 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed">
                      Já Presenteado
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleReserveClick(gift)}
                      className="w-full py-3 bg-gold hover:bg-gold/90 text-white font-semibold rounded-lg transition"
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

      {/* Modal de Reserva */}
      {selectedGift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-display text-rose-gold mb-4">Presentear: {selectedGift.nome}</h2>
            <p className="text-sm text-gray-600 mb-6">
              Para reservar este presente, precisamos de alguns dados. Assim garantimos que o presente seja único!
            </p>
            
            {reserveError && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{reserveError}</div>}
            
            <form onSubmit={submitReserve} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  className="w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold outline-none"
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  required
                  value={guestWhatsapp}
                  onChange={e => setGuestWhatsapp(e.target.value)}
                  className="w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold outline-none"
                  placeholder="Ex: 11999999999"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedGift(null)}
                  className="flex-1 px-4 py-2 border border-gold text-gold rounded-lg font-semibold hover:bg-gold/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reserving}
                  className="flex-1 px-4 py-2 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 disabled:opacity-70"
                >
                  {reserving ? 'Reservando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Sucesso (Instruções de pagamento) */}
      {successGift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-display text-rose-gold mb-2">Muito Obrigado!</h2>
            <p className="text-gray-600 mb-6">
              Você acabou de reservar <strong>{successGift.nome}</strong> para os noivos!
            </p>

            <div className="bg-cream p-4 rounded-lg mb-6 text-left border border-gold border-opacity-20">
              <h4 className="font-semibold text-gray-800 mb-3 text-center">Como finalizar seu presente:</h4>
              
              {successGift.chave_pix ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Chave PIX para transferência:</p>
                  <div className="bg-white p-3 rounded border border-gray-200 font-mono text-rose-gold text-sm break-all flex justify-between items-center">
                    <span>{successGift.chave_pix}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(successGift.chave_pix)}
                      className="ml-2 px-2 py-1 bg-gold/10 text-gold text-xs rounded hover:bg-gold/20"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              ) : null}

              {successGift.sites && successGift.sites.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Links para compra:</p>
                  <div className="space-y-2">
                    {successGift.sites.map((site, i) => (
                      <a 
                        key={i} 
                        href={site.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full text-center py-2 bg-white border border-gold text-gold rounded hover:bg-gold hover:text-white transition"
                      >
                        Comprar na loja: {site.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {!successGift.chave_pix && (!successGift.sites || successGift.sites.length === 0) && (
                <p className="text-sm text-gray-500 text-center italic">
                  (O casal não forneceu instruções automáticas. Entre em contato com eles!)
                </p>
              )}
            </div>

            <button
              onClick={closeSuccess}
              className="w-full px-6 py-3 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
