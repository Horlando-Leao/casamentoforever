export default function GiftCard({ gift, onView, onEdit, onDelete }) {
  const displayPix = gift.chave_pix
    ? gift.chave_pix.length > 20
      ? gift.chave_pix.substring(0, 17) + '...'
      : gift.chave_pix
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-soft hover:shadow-floating hover:-translate-y-1 transition-all duration-300 overflow-hidden group border border-cream-dark">
      <div
        className="w-full aspect-[4/3] bg-cream-alt overflow-hidden cursor-pointer flex items-center justify-center relative"
        onClick={onView}
        title="Clique para ver detalhes"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-cream-dark/20 to-transparent z-0"></div>
        {gift.imagem_url ? (
          <img
            src={gift.imagem_url}
            alt={gift.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 relative z-10"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-110 transition duration-500 relative z-10">
            💝
          </div>
        )}
      </div>

      <div className="p-5">
        <h3
          className="font-display text-xl font-semibold text-text-primary mb-1 cursor-pointer hover:text-gold-dark transition-colors line-clamp-2"
          onClick={onView}
        >
          {gift.nome}
        </h3>

        {gift.descricao && (
          <p className="text-xs text-text-secondary line-clamp-2 mb-3 italic opacity-80">
            "{gift.descricao}"
          </p>
        )}

        {gift.preco && (
          <p className="text-gold-dark font-bold text-lg mb-3">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gift.preco)}
          </p>
        )}

        {displayPix && (
          <div className="mb-4 p-3 bg-cream rounded-xl border border-gold-light/30">
            <p className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-semibold">Chave PIX</p>
            <p className="text-sm font-mono text-text-primary truncate">{displayPix}</p>
          </div>
        )}

        {/* Action Buttons - Only show if onEdit/onDelete are provided (Dashboard context) */}
        {(onEdit || onDelete) && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-cream-dark">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gold-dark bg-gold/10 hover:bg-gold/20 rounded-xl transition-colors"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex-1 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                Excluir
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
