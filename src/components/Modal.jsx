import React from 'react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmLabel = 'Confirmar', 
  cancelLabel = 'Cancelar', 
  type = 'confirm' 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Overlay click to close - only for alerts or if cancel is just closing */}
      <div className="absolute inset-0" onClick={() => {
        if (type === 'alert') {
          onClose();
        } else if (onCancel) {
          onCancel();
          onClose();
        } else {
          onClose();
        }
      }}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-floating overflow-hidden animate-slide-up-sheet sm:animate-slide-up">
        {/* Decorative element for mobile */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-4 sm:hidden"></div>
        
        <div className="p-6 sm:p-8 text-center">
          {title && (
            <h3 className="text-xl font-display text-text-primary mb-3">
              {title}
            </h3>
          )}
          {message && (
            <p className="text-text-secondary text-sm leading-relaxed mb-8">
              {message}
            </p>
          )}
          
          <div className="flex flex-col gap-3">
            {type === 'confirm' ? (
              <>
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  className="w-full py-3.5 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl transition-all shadow-md shadow-gold/20 active:scale-95"
                >
                  {confirmLabel}
                </button>
                <button
                  onClick={() => {
                    if (onCancel) onCancel();
                    onClose();
                  }}
                  className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-text-secondary font-bold rounded-xl border border-gray-200 transition-all active:scale-95"
                >
                  {cancelLabel}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl transition-all shadow-md shadow-gold/20 active:scale-95"
              >
                {confirmLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
