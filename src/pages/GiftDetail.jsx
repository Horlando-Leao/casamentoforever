import { useEffect, useState } from 'react';
import { getGift, deleteGift, updateGift } from '../services/api';

export default function GiftDetail({ tenant, giftId, onDelete, onBack }) {
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Campos editáveis
  const [nome, setNome] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [chavePix, setChavePix] = useState('');
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
      <header className="bg-white border-b border-gold border-opacity-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button onClick={onBack} className="text-gold font-semibold hover:text-rose-gold mb-4 block">
            ← Voltar
          </button>
          <h1 className="text-3xl font-display text-rose-gold">{gift.nome}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {imagemUrl && (
            <div className="w-full h-72 bg-cream overflow-hidden">
              <img
                src={imagemUrl}
                alt={nome}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="p-8 space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Presente</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                disabled={!isEditing}
                className={inputClass}
              />
            </div>

            {/* Imagem URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">URL da Imagem</label>
              <input
                type="url"
                value={imagemUrl}
                onChange={e => setImagemUrl(e.target.value)}
                disabled={!isEditing}
                className={inputClass}
              />
            </div>

            {/* Chave PIX */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Chave PIX</label>
              <input
                type="text"
                value={chavePix}
                onChange={e => setChavePix(e.target.value)}
                disabled={!isEditing}
                className={inputClass}
              />
            </div>

            {/* Links */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Links para compra</label>
              {sites.length === 0 && !isEditing && (
                <p className="text-sm text-gray-400 italic">Nenhum link cadastrado</p>
              )}
              {sites.map((site, i) => (
                <div key={i} className="mb-3 p-4 border border-gold border-opacity-20 rounded-lg bg-cream/50">
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    <input
                      type="text"
                      value={site.label}
                      onChange={e => handleUpdateSite(i, 'label', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Ex: Amazon"
                      className={siteInputClass}
                    />
                    <input
                      type="url"
                      value={site.url}
                      onChange={e => handleUpdateSite(i, 'url', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://..."
                      className={siteInputClass}
                    />
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSite(i)}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      ✕ Remover
                    </button>
                  )}
                </div>
              ))}
              {isEditing && sites.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddSite}
                  className="text-sm text-gold font-semibold hover:text-rose-gold"
                >
                  + Adicionar link
                </button>
              )}
            </div>

            {/* Meta */}
            <div className="pt-4 border-t border-gray-100 space-y-1 text-xs text-gray-400">
              <p>Criado em: {new Date(gift.created_at).toLocaleDateString('pt-BR')}</p>
              {gift.updated_at && (
                <p>Atualizado em: {new Date(gift.updated_at).toLocaleDateString('pt-BR')}</p>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-6 py-2 bg-gold hover:bg-gold/90 text-white font-semibold rounded-lg transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                  >
                    {deleting ? 'Excluindo...' : 'Excluir'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-6 py-2 bg-gold hover:bg-gold/90 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-6 py-2 border border-gold text-gold hover:bg-gold/10 font-semibold rounded-lg transition"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
