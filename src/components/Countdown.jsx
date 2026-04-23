import { useState, useEffect } from 'react';

export default function Countdown({ date, time }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!date) return;

    const calculateTimeLeft = () => {
      // Garantir que a data seja interpretada corretamente no fuso local
      // Formato esperado de date: YYYY-MM-DD
      // Formato esperado de time: HH:mm
      const eventDate = new Date(`${date}T${time || '00:00'}:00`);
      const now = new Date();
      const diff = eventDate - now;

      if (diff <= 0) {
        return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        total: diff,
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [date, time]);

  if (!timeLeft || !date) return null;

  const { total, days, hours, minutes, seconds } = timeLeft;

  // Design "minilista e bonito"
  
  if (total === 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-gold/10 text-rose-gold rounded-full text-[11px] font-bold animate-fade-in border border-rose-gold/20">
        <span className="w-1.5 h-1.5 bg-rose-gold rounded-full animate-pulse"></span>
        ✨ É hoje! ✨
      </div>
    );
  }

  // Se faltar mais de 1 dia, mostra dias
  if (days > 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-gold-dark rounded-full text-[11px] font-bold animate-fade-in border border-gold/20">
        <span className="opacity-60 font-medium">Faltam</span>
        <span className="bg-gold-dark text-white px-1.5 py-0.5 rounded-md text-[10px] min-w-[20px] text-center">{days}</span>
        <span>{days === 1 ? 'dia' : 'dias'}</span>
      </div>
    );
  }

  // Se for o último dia (menos de 24h), mostra horas
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-gold/10 text-rose-gold rounded-full text-[11px] font-bold animate-fade-in border border-rose-gold/20">
      <span className="opacity-60 font-medium uppercase tracking-tighter">Últimas</span>
      <div className="flex gap-1 tabular-nums items-center">
        <span className="bg-rose-gold text-white px-1 py-0.5 rounded text-[10px]">{String(hours).padStart(2, '0')}</span>
        <span className="animate-pulse opacity-50">:</span>
        <span className="bg-rose-gold text-white px-1 py-0.5 rounded text-[10px]">{String(minutes).padStart(2, '0')}</span>
        <span className="animate-pulse opacity-50">:</span>
        <span className="bg-rose-gold text-white px-1 py-0.5 rounded text-[10px]">{String(seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
