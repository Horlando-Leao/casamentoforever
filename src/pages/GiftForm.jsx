import { useEffect, useState } from 'react';
import { createGift, getGift, updateGift } from '../services/api';
import ImagePreview from '../components/ImagePreview';
import { DEFAULT_GIFTS, CATEGORIAS } from '../lib/defaultGifts';

// ─── Modal de Presentes Padrões ──────────────────────────────────────────────
function DefaultGiftsModal({ onSelect, onClose }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [busca, setBusca] = useState('');

  const categorias = ['Todos', ...CATEGORIAS];

  const filtrados = DEFAULT_GIFTS.filter((g) => {
    const matchCategoria = categoriaAtiva === 'Todos' || g.categoria === categoriaAtiva;
    const matchBusca = g.nome.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  return (
    // z-[60] fica acima da BottomNav (z-50). pb-16 no overlay empurra o sheet
    // para cima da bottom nav (h-16 = 64px) no mobile.
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm pb-16 sm:pb-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Sheet: altura máxima descontando a nav (64px) + safe area */}
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col"
           style={{ maxHeight: 'calc(90vh - 64px)' }}>

        {/* Header compacto mobile */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-gray-900">✨ Presentes Sugeridos</h2>
            <p className="text-xs text-gray-500 hidden sm:block mt-0.5">Selecione para pré-preencher o formulário</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Search + Categorias juntos numa faixa compacta */}
        <div className="px-4 sm:px-6 pt-3 pb-2 space-y-2 shrink-0">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar presente..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-50"
            />
          </div>

          {/* Categorias com scroll horizontal */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  categoriaAtiva === cat
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Presentes — scroll vertical aqui */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 pb-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          {filtrados.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">🔍</p>
              <p className="text-sm">Nenhum presente encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {filtrados.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => onSelect(gift)}
                  className="group text-left bg-gray-50 border border-gray-100 active:border-amber-300 active:bg-amber-50/50 rounded-xl overflow-hidden transition-all active:scale-95"
                >
                  {/* Imagem quadrada */}
                  <div className="w-full aspect-square bg-white overflow-hidden relative">
                    <img
                      src={gift.imagem_url}
                      alt={gift.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full items-center justify-center text-3xl" style={{ display: 'none' }}>
                      {gift.emoji}
                    </div>
                    <span className="absolute top-1.5 left-1.5 bg-white/90 text-[10px] font-bold text-gray-500 px-1.5 py-0.5 rounded-full leading-tight">
                      {gift.categoria}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-2 sm:p-3">
                    <p className="text-xs font-bold text-gray-800 leading-tight line-clamp-2">{gift.nome}</p>
                    <p className="text-xs font-bold text-amber-600 mt-1">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gift.preco)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint — oculto no mobile para ganhar espaço */}
        <div className="hidden sm:block px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-3xl shrink-0">
          <p className="text-xs text-center text-gray-400">
            Clique em um presente para pré-preencher o formulário. Você poderá editar antes de salvar.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Formulário Principal ─────────────────────────────────────────────────────
export default function GiftForm({ tenant, giftId, onSave, onCancel }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [preco, setPreco] = useState('');
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(giftId ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDefaultModal, setShowDefaultModal] = useState(false);

  useEffect(() => {
    if (giftId) {
      loadGift();
    }
  }, [giftId, tenant]);

  const loadGift = async () => {
    try {
      const data = await getGift(tenant, giftId);
      const gift = data.gift;
      setNome(gift.nome);
      setDescricao(gift.descricao || '');
      setImagemUrl(gift.imagem_url || '');
      setPreco(gift.preco || '');
      setSites(gift.sites || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar presente');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDefault = (gift) => {
    setNome(gift.nome);
    setDescricao(gift.descricao || '');
    setImagemUrl(gift.imagem_url);
    setPreco(String(gift.preco));
    setSites(gift.sites || []);
    setShowDefaultModal(false);
    setError('');
  };

  const handleAddSite = () => {
    if (sites.length < 3) {
      setSites([...sites, { label: '', url: '' }]);
    }
  };

  const handleRemoveSite = (index) => {
    setSites(sites.filter((_, i) => i !== index));
  };

  const handleUpdateSite = (index, field, value) => {
    const newSites = [...sites];
    newSites[index][field] = value;
    setSites(newSites);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (!nome) {
        setError('O nome do presente é obrigatório');
        return;
      }

      const giftData = {
        nome,
        descricao: descricao || null,
        imagem_url: imagemUrl || null,
        preco: preco ? parseFloat(preco) : null,
        sites: sites.filter(s => s.label && s.url),
      };

      if (giftId) {
        await updateGift(tenant, giftId, giftData);
      } else {
        await createGift(tenant, giftData);
      }

      onSave();
    } catch (err) {
      setError(err.message || 'Falha ao salvar presente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-gold border-opacity-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-display text-rose-gold">
            {giftId ? 'Editar Presente' : 'Novo Presente'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Botão de Presentes Padrões (só no modo criação) */}
        {!giftId && (
          <button
            type="button"
            onClick={() => setShowDefaultModal(true)}
            className="w-full mb-6 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-bold rounded-2xl shadow-md shadow-amber-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">✨</span>
            <div className="text-left">
              <p className="text-sm font-bold leading-tight">Escolher Presente Sugerido</p>
              <p className="text-xs font-normal text-yellow-100">Pré-preenche o formulário com um clique</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto opacity-80 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          {/* Prévia do presente selecionado */}
          {imagemUrl && nome && !giftId && (
            <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <img
                src={imagemUrl}
                alt={nome}
                className="w-16 h-16 object-cover rounded-xl border border-amber-200"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-0.5">Presente selecionado</p>
                <p className="text-sm font-semibold text-gray-800">{nome}</p>
                {preco && (
                  <p className="text-sm text-amber-700 font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowDefaultModal(true)}
                className="ml-auto text-xs text-amber-600 hover:text-amber-800 font-semibold underline underline-offset-2"
              >
                Trocar
              </button>
            </div>
          )}

          {/* Gift Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Presente *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Batedeira KitchenAid"
              className="w-full px-4 py-2.5 border border-gold border-opacity-30 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition bg-white"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Conte algo engraçado sobre esse presente..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gold border-opacity-30 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition bg-white resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL da Imagem
            </label>
            <input
              type="text"
              value={imagemUrl}
              onChange={(e) => setImagemUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg ou /gifts/panelas.png"
              className="w-full px-4 py-2.5 border border-gold border-opacity-30 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition bg-white"
            />
            {imagemUrl && <ImagePreview url={imagemUrl} />}
          </div>

          {/* Valor do Presente */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Valor do Presente (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="Ex: 150,50"
              className="w-full px-4 py-2.5 border border-gold border-opacity-30 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition bg-white"
            />
          </div>

          {/* Shopping Sites */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Links para compra (até 3) — <span className="font-normal text-gray-500">opcional</span>
            </label>

            {sites.map((site, index) => (
              <div key={index} className="mb-4 p-4 border border-gold border-opacity-20 rounded-xl bg-cream/50">
                <div className="grid grid-cols-1 gap-3 mb-3">
                  <input
                    type="text"
                    value={site.label}
                    onChange={(e) => handleUpdateSite(index, 'label', e.target.value)}
                    placeholder="Nome da loja (ex: Amazon)"
                    className="px-3 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none text-sm"
                  />
                  <input
                    type="url"
                    value={site.url}
                    onChange={(e) => handleUpdateSite(index, 'url', e.target.value)}
                    placeholder="https://..."
                    className="px-3 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSite(index)}
                  className="text-sm text-red-500 hover:text-red-700 font-semibold"
                >
                  ✕ Remover
                </button>
              </div>
            ))}

            {sites.length < 3 && (
              <button
                type="button"
                onClick={handleAddSite}
                className="text-sm text-gold font-semibold hover:text-rose-gold flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Adicionar link
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-gold font-semibold hover:text-rose-gold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 bg-gold hover:bg-gold/90 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {saving ? 'Salvando...' : 'Salvar Presente'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <button
            onClick={onCancel}
            className="text-gold font-semibold hover:text-rose-gold"
          >
            ← Voltar
          </button>
        </div>
      </main>

      {/* Modal de Presentes Padrões */}
      {showDefaultModal && (
        <DefaultGiftsModal
          onSelect={handleSelectDefault}
          onClose={() => setShowDefaultModal(false)}
        />
      )}
    </div>
  );
}
