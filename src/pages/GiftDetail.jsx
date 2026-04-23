import { useEffect, useState } from 'react';
import { getGift, deleteGift, updateGift } from '../services/api';

export default function GiftDetail({ tenant, giftId, onDelete, onBack }) {
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  // Campos editáveis
  const [nome, setNome] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [preco, setPreco] = useState('');
  const [sites, setSites] = useState([]);

  useEffect(() => { loadGift(); }, [giftId, tenant]);

  const loadGift = async () => {
    try {
      const data = await getGift(tenant, giftId);
      const g = data.gift;
      setGift(g);
      setNome(g.nome);
      setImagemUrl(g.imagem_url || '');
      setChavePix(g.chave_pix || '');
      setPreco(g.preco || '');
      setSites(g.sites || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar presente');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setNome(gift.nome);
    setImagemUrl(gift.imagem_url || '');
    setChavePix(gift.chave_pix || '');
    setPreco(gift.preco || '');
    setSites(gift.sites || []);
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (!nome) { setError('O nome do presente é obrigatório'); return; }
    setSaving(true);
    setError('');
    try {
      const updated = await updateGift(tenant, giftId, {
        nome,
        imagem_url: imagemUrl || null,
        chave_pix: chavePix || null,
        preco: preco ? parseFloat(preco) : null,
        sites: sites.filter(s => s.label && s.url),
      });
      setGift(updated.gift);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Falha ao salvar presente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este presente?')) return;
    try {
      setDeleting(true);
      await deleteGift(tenant, giftId);
      onDelete();
    } catch (err) {
      setError(err.message || 'Falha ao excluir presente');
      setDeleting(false);
    }
  };

  const handleAddSite = () => {
    if (sites.length < 3) setSites([...sites, { label: '', url: '' }]);
  };
  const handleRemoveSite = (i) => setSites(sites.filter((_, idx) => idx !== i));
  const handleUpdateSite = (i, field, value) => {
    const s = [...sites]; s[i][field] = value; setSites(s);
  };

  const inputBase = 'w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg outline-none transition';
  const inputClass = isEditing
    ? `${inputBase} focus:ring-2 focus:ring-gold focus:border-transparent bg-white`
    : `${inputBase} bg-gray-50 text-gray-700 cursor-default select-none`;

  const siteInputClass = isEditing
    ? 'px-3 py-2 border border-gold border-opacity-30 rounded-lg outline-none text-sm focus:ring-2 focus:ring-gold bg-white w-full transition'
    : 'px-3 py-2 border border-gold border-opacity-30 rounded-lg text-sm bg-gray-50 text-gray-700 cursor-default w-full';

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Presente não encontrado</p>
          <button onClick={onBack} className="text-gold font-semibold hover:text-rose-gold">← Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-cream-dark shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gold-dark font-medium hover:text-rose-gold transition-colors p-2 -ml-2 rounded-lg hover:bg-cream-alt">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Voltar
          </button>
          {!isEditing && (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(true)} className="p-2 text-text-secondary hover:text-gold-dark hover:bg-cream-alt rounded-lg transition-colors" title="Editar">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button onClick={handleDelete} disabled={deleting} className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center flex items-center justify-center gap-2"><span className="font-semibold">Erro:</span> {error}</div>}

        <div className="bg-white rounded-3xl shadow-soft-lg overflow-hidden border border-cream-dark">
          {imagemUrl && !isEditing ? (
            <div className="relative group w-full aspect-[16/9] sm:aspect-[2/1] bg-cream-alt overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
              <img
                src={imagemUrl}
                alt={nome}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowFullImage(true)}
                className="absolute bottom-4 right-4 p-2.5 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-gold-dark rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20"
                title="Expandir imagem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <h1 className="absolute bottom-6 left-6 right-16 text-3xl sm:text-4xl font-display text-white z-20 text-shadow-sm font-semibold truncate">
                {gift.nome}
              </h1>
            </div>
          ) : (
            <div className="px-8 pt-8 pb-4 border-b border-cream-dark bg-cream-alt/30">
               <h1 className="text-3xl sm:text-4xl font-display text-text-primary text-center">
                 {isEditing ? 'Editar Presente' : gift.nome}
               </h1>
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            {/* Nome */}
            {isEditing && (
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2 tracking-wide uppercase">Nome do Presente</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className={inputClass}
                  placeholder="Ex: Jogo de Panelas"
                />
              </div>
            )}

            {/* Valor do Presente */}
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2 tracking-wide uppercase">Valor</label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">R$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={preco}
                    onChange={e => setPreco(e.target.value)}
                    className={`${inputClass} pl-12`}
                    placeholder="0.00"
                  />
                </div>
              ) : (
                <div className="text-3xl font-bold text-gold-dark">
                  {preco ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco) : <span className="text-gray-400 font-normal text-lg">Não definido</span>}
                </div>
              )}
            </div>

            {/* Imagem URL */}
            {isEditing && (
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2 tracking-wide uppercase">URL da Imagem</label>
                <input
                  type="url"
                  value={imagemUrl}
                  onChange={e => setImagemUrl(e.target.value)}
                  className={inputClass}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            )}

            {/* Chave PIX */}
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2 tracking-wide uppercase">Chave PIX</label>
              {isEditing ? (
                <input
                  type="text"
                  value={chavePix}
                  onChange={e => setChavePix(e.target.value)}
                  className={inputClass}
                  placeholder="CPF, E-mail, Celular ou Aleatória"
                />
              ) : chavePix ? (
                <div className="flex items-center justify-between p-4 bg-cream rounded-xl border border-gold-light/30">
                  <span className="font-mono text-text-primary break-all mr-4">{chavePix}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(chavePix)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gold/30 text-gold-dark text-xs font-bold rounded-lg hover:bg-gold/10 transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    COPIAR
                  </button>
                </div>
              ) : (
                <p className="text-text-light italic">Nenhuma chave PIX vinculada a este presente.</p>
              )}
            </div>

            {/* Links */}
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-3 tracking-wide uppercase">Links para compra</label>
              {sites.length === 0 && !isEditing && (
                <p className="text-text-light italic">Nenhum link sugerido para compra.</p>
              )}
              {sites.map((site, i) => (
                <div key={i} className={`mb-3 ${isEditing ? 'p-4 border border-cream-dark rounded-xl bg-gray-50/50' : ''}`}>
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-3 mb-3">
                      <input
                        type="text"
                        value={site.label}
                        onChange={e => handleUpdateSite(i, 'label', e.target.value)}
                        placeholder="Nome da Loja (ex: Amazon)"
                        className={siteInputClass}
                      />
                      <input
                        type="url"
                        value={site.url}
                        onChange={e => handleUpdateSite(i, 'url', e.target.value)}
                        placeholder="https://..."
                        className={siteInputClass}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSite(i)}
                        className="text-sm text-red-500 hover:text-red-700 font-semibold justify-self-end mt-1"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <a 
                      href={site.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 bg-white border border-gold-light/40 rounded-xl hover:border-gold hover:shadow-md transition-all group"
                    >
                      <span className="font-medium text-text-primary group-hover:text-gold-dark transition-colors">{site.label}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold/50 group-hover:text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
              {isEditing && sites.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddSite}
                  className="mt-2 text-sm text-gold-dark font-bold hover:text-rose-gold flex items-center gap-1 bg-gold/10 px-4 py-2 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Adicionar link
                </button>
              )}
            </div>

            {/* Meta Info */}
            {!isEditing && (
              <div className="pt-6 border-t border-cream-dark text-xs text-text-light flex justify-between">
                <span>Adicionado em: {new Date(gift.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            
            {/* Botões do Formulário de Edição */}
            {isEditing && (
              <div className="flex gap-3 pt-6 border-t border-cream-dark sticky bottom-4 z-10 bg-white/80 backdrop-blur-sm p-4 -mx-6 -mb-6 mt-4">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-3.5 border border-cream-dark text-text-secondary hover:bg-gray-50 font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[2] py-3.5 bg-gold hover:bg-gold-dark disabled:bg-gray-300 text-white font-bold rounded-xl shadow-md shadow-gold/20 transition-all"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Full Screen Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setShowFullImage(false)}
        >
          <img 
            src={imagemUrl} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain shadow-2xl" 
          />
          <button className="absolute top-4 right-4 text-white text-4xl">&times;</button>
        </div>
      )}
    </div>
  );
}
