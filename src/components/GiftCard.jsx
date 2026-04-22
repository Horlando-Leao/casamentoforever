export default function GiftCard({ gift, onView, onEdit, onDelete }) {
  const displayPix = gift.chave_pix
    ? gift.chave_pix.length > 20
      ? gift.chave_pix.substring(0, 17) + '...'
      : gift.chave_pix
    : null;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition group">
      <div
        className="w-full h-48 bg-cream overflow-hidden cursor-pointer"
        onClick={onView}
        title="Clique para ver detalhes"
      >
        {gift.imagem_url ? (
          <img
            src={gift.imagem_url}
            alt={gift.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-110 transition duration-300">
            💝
          </div>
        )}
      </div>

      <div className="p-4">
        <h3
          className="text-lg font-semibold text-gray-800 truncate mb-2 cursor-pointer hover:text-rose-gold transition"
          onClick={onView}
        >
          {gift.nome}
        </h3>

        {displayPix && (
          <div className="mb-3 p-2 bg-gold/10 rounded border border-gold border-opacity-30">
            <p className="text-xs text-gray-600 mb-1">PIX:</p>
            <p className="text-sm font-mono text-rose-gold truncate">{displayPix}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 text-sm font-semibold text-gold hover:text-rose-gold transition"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="flex-1 px-3 py-2 text-sm font-semibold text-red-600 hover:text-red-700 transition"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
