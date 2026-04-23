import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeComponent({ qrToken, tenantSlug }) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (!qrToken) return;

    const generateQR = async () => {
      try {
        const qrUrl = `${window.location.origin}/#/convite/${qrToken}`;
        const dataUrl = await QRCode.toDataURL(qrUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [qrToken]);

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `convite-qrcode-${qrToken.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!qrDataUrl) {
    return <div className="text-center py-8">Gerando QR code...</div>;
  }

  const qrUrl = `${window.location.origin}/#/convite/${qrToken}`;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="p-6 bg-white rounded-2xl border border-cream-dark shadow-soft">
        <img src={qrDataUrl} alt="QR Code do Convite" className="w-64 h-64" />
      </div>

      <button
        onClick={handleDownloadQR}
        className="flex items-center gap-2 px-6 py-3 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Baixar QR Code (PNG)
      </button>
      
      <div className="w-full max-w-md">
        <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Link do Convite</p>
        <div className="flex items-center gap-2 bg-gray-50 border border-cream-dark rounded-xl p-3">
          <input
            type="text"
            value={qrUrl}
            readOnly
            className="flex-1 bg-transparent outline-none text-sm font-mono text-text-primary"
          />
          <button
            onClick={() => navigator.clipboard.writeText(qrUrl)}
            className="shrink-0 px-3 py-1.5 bg-gold/10 text-gold-dark text-xs font-bold rounded-lg hover:bg-gold/20 transition-colors"
          >
            COPIAR
          </button>
        </div>
      </div>
    </div>
  );
}
