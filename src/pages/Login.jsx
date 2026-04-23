import { useState } from 'react';
import { login } from '../services/api';

export default function Login({ onLoginSuccess, onRegisterClick }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !senha) {
        setError('Por favor, preencha todos os campos');
        return;
      }
      const tenant = await login(email, senha);
      onLoginSuccess(tenant);
    } catch (err) {
      setError(err.message || 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row selection:bg-rose-gold/20">
      {/* Lado da Imagem (Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-cream-alt relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-gold/20 via-gold/10 to-transparent z-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMODggWk04IDBMMCA4IFoiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-40 z-0"></div>
        
        <div className="relative z-20 text-center px-12">
          <div className="text-8xl mb-8 opacity-90 drop-shadow-lg">✨</div>
          <h2 className="text-5xl font-display text-gold-dark mb-6 leading-tight">
            Acompanhe a sua<br/>lista de presentes
          </h2>
          <p className="text-xl text-text-secondary font-light">
            Gerencie seus presentes, veja as mensagens dos seus convidados e muito mais.
          </p>
        </div>
      </div>

      {/* Lado do Formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:px-12 lg:px-24 bg-white relative">
        {/* Decoração sutil mobile */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-cream-alt to-transparent md:hidden"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10">
            <div className="text-5xl md:text-6xl mb-4 inline-block drop-shadow-sm">💍</div>
            <h1 className="text-4xl md:text-5xl font-display text-rose-gold mb-3">CasamentoForever</h1>
            <p className="text-text-secondary font-medium tracking-wide">BEM-VINDO DE VOLTA</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-5 py-4 bg-gray-50/50 border border-cream-dark rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold outline-none transition-all text-lg placeholder-gray-400"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider">Senha</label>
                <a href="#" className="text-sm font-semibold text-gold-dark hover:text-rose-gold transition-colors">Esqueceu?</a>
              </div>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-gray-50/50 border border-cream-dark rounded-xl focus:ring-2 focus:ring-gold-light focus:border-gold outline-none transition-all text-lg tracking-widest placeholder:tracking-normal placeholder-gray-400"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-dark disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-lg mt-4"
            >
              {loading ? 'Entrando...' : 'Entrar na minha conta'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-text-secondary">
              Ainda não tem uma conta?{' '}
              <button
                onClick={onRegisterClick}
                className="text-gold-dark font-bold hover:text-rose-gold transition-colors ml-1"
              >
                Crie agora
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
