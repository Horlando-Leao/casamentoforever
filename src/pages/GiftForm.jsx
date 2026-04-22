import { useEffect, useState } from 'react';
import { createGift, getGift, updateGift } from '../services/api';
import ImagePreview from '../components/ImagePreview';

export default function GiftForm({ tenant, giftId, onSave, onCancel }) {
  const [nome, setNome] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [preco, setPreco] = useState('');
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(giftId ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      setImagemUrl(gift.imagem_url || '');
      setChavePix(gift.chave_pix || '');
      setPreco(gift.preco || '');
      setSites(gift.sites || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar presente');
    } finally {
      setLoading(false);
    }
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
        imagem_url: imagemUrl || null,
        chave_pix: chavePix || null,
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
      <main className="max-w-2xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
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
              className="w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL da Imagem
            </label>
            <input
              type="url"
              value={imagemUrl}
              onChange={(e) => setImagemUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
            />
            {imagemUrl && <ImagePreview url={imagemUrl} />}
          </div>

          {/* Chave PIX */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chave PIX (Opcional)
            </label>
            <input
              type="text"
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
              placeholder="E-mail, CPF ou chave aleatória"
              className="w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition bg-white"
            />
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
              className="w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition bg-white"
            />
          </div>

          {/* Shopping Sites */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Links para compra (até 3)
            </label>

            {sites.map((site, index) => (
              <div key={index} className="mb-4 p-4 border border-gold border-opacity-20 rounded-lg bg-cream/50">
                <div className="grid grid-cols-1 gap-3 mb-3">
                  <input
                    type="text"
                    value={site.label}
                    onChange={(e) => handleUpdateSite(index, 'label', e.target.value)}
                    placeholder="e.g., Amazon"
                    className="px-3 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none text-sm"
                  />
                  <input
                    type="url"
                    value={site.url}
                    onChange={(e) => handleUpdateSite(index, 'url', e.target.value)}
                    placeholder="https://example.com/product"
                    className="px-3 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSite(index)}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  ✕ Remover
                </button>
              </div>
            ))}

            {sites.length < 3 && (
              <button
                type="button"
                onClick={handleAddSite}
                className="text-sm text-gold font-semibold hover:text-rose-gold"
              >
                + Adicionar link
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gold font-semibold hover:text-rose-gold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gold hover:bg-gold/90 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
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
    </div>
  );
}
