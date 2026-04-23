import { useEffect, useState } from 'react';
import { getEventDetails, saveEventDetails, regenerateQRToken } from '../services/api';
import QRCodeComponent from '../components/QRCodeComponent';

export default function EventForm({ tenant, onBack, showModal }) {
  const [eventData, setEventData] = useState({
    endereco: '',
    horario: '',
    data_evento: '',
    dress_code: '',
    observacoes: '',
    contato_telefone: '',
    google_maps_url: '',
  });

  const [qrToken, setQrToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [tenant]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const data = await getEventDetails(tenant);
      if (data.event) {
        setEventData({
          endereco: data.event.endereco || '',
          horario: data.event.horario || '',
          data_evento: data.event.data_evento || '',
          dress_code: data.event.dress_code || '',
          observacoes: data.event.observacoes || '',
          contato_telefone: data.event.contato_telefone || '',
          google_maps_url: data.event.google_maps_url || '',
        });
        setQrToken(data.event.qr_token || '');
      }
    } catch (err) {
      // Event doesn't exist yet, will be created on first save
      console.log('No event details found');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = await saveEventDetails(tenant, eventData);
      setQrToken(data.event.qr_token);
      setSuccess('Detalhes do evento salvos com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao salvar detalhes do evento');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateQR = async () => {
    showModal({
      title: 'Regenerar QR Code?',
      message: 'Tem certeza que deseja regenerar o QR code? O link anterior não funcionará mais e você precisará compartilhar o novo link.',
      confirmLabel: 'Sim, Regenerar',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        try {
          const data = await regenerateQRToken(tenant);
          setQrToken(data.qr_token);
          setSuccess('QR code regenerado com sucesso!');
          setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
          setError(err.message || 'Erro ao regenerar QR code');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-cream selection:bg-rose-gold/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-cream-dark shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display text-text-primary">Detalhes do Evento</h1>
            <p className="text-sm font-bold text-text-secondary uppercase tracking-widest mt-1">Convite</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2.5 sm:py-2 text-sm font-bold text-text-secondary bg-gray-50 border border-gray-200 hover:text-text-primary hover:bg-gray-100 rounded-xl transition-all"
          >
            Voltar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulário */}
          <div>
            <div className="bg-white rounded-2xl shadow-soft border border-cream-dark p-6 sm:p-8">
              <h2 className="text-xl font-display text-text-primary mb-6">Informações do Evento</h2>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                    Data do Evento
                  </label>
                  <input
                    type="date"
                    name="data_evento"
                    value={eventData.data_evento}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-cream-dark rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold outline-none transition-all text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                    Horário
                  </label>
                  <input
                    type="time"
                    name="horario"
                    value={eventData.horario}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-cream-dark rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold outline-none transition-all text-base"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Endereço
                    </label>
                    {eventData.endereco && (
                      <button
                        type="button"
                        onClick={() => setEventData(prev => ({ ...prev, endereco: '' }))}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-all uppercase tracking-wider"
                      >
                        Remover endereço
                      </button>
                    )}
                  </div>
                  <textarea
                    name="endereco"
                    value={eventData.endereco}
                    onChange={handleInputChange}
                    placeholder="Rua, número, complemento..."
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-cream-dark rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold outline-none transition-all text-base resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                    Link do Google Maps (Opcional)
                  </label>
                  <input
                    type="url"
                    name="google_maps_url"
                    value={eventData.google_maps_url}
                    onChange={handleInputChange}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full px-4 py-3 bg-gray-50 border border-cream-dark rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold outline-none transition-all text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                    Telefone para Contato (Dúvidas)
                  </label>
                  <input
                    type="text"
                    name="contato_telefone"
                    value={eventData.contato_telefone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 bg-gray-50 border border-cream-dark rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold outline-none transition-all text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                    Dress Code
                  </label>
                  <input
                    type="text"
                    name="dress_code"
                    value={eventData.dress_code}
                    onChange={handleInputChange}
                    placeholder="Ex: Formal, Social..."
                    className="w-full px-4 py-3 bg-gray-50 border border-cream-dark rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold outline-none transition-all text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                    Observações (Opcional)
                  </label>
                  <textarea
                    name="observacoes"
                    value={eventData.observacoes}
                    onChange={handleInputChange}
                    placeholder="Informações adicionais para os convidados..."
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-cream-dark rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold outline-none transition-all text-base resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl shadow-md shadow-gold/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Detalhes'}
                </button>
              </form>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <div className="bg-white rounded-2xl shadow-soft border border-cream-dark p-6 sm:p-8">
              <h2 className="text-xl font-display text-text-primary mb-6">QR Code do Convite</h2>

              {!qrToken ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">📱</div>
                  <p className="text-text-secondary mb-6">
                    Salve os detalhes do evento para gerar o QR code.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <QRCodeComponent qrToken={qrToken} tenantSlug={tenant} />
                  </div>

                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="w-full mb-4 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all"
                  >
                    {showQR ? 'Ocultar' : 'Ver'} Instruções
                  </button>

                  {showQR && (
                    <div className="mb-6 p-4 bg-cream-alt rounded-xl border border-gold-light/30 text-sm text-text-secondary space-y-2">
                      <p className="font-bold text-text-primary">Como compartilhar o convite:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Exiba o QR code na festa ou evento</li>
                        <li>Compartilhe o link via WhatsApp ou Email</li>
                        <li>Imprima o QR code para convites físicos</li>
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={handleRegenerateQR}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all"
                  >
                    Regenerar QR Code
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
