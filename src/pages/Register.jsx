import { useState } from 'react';
import { register } from '../services/api';

export default function Register({ onRegisterSuccess, onLoginClick }) {
  const [nome1, setNome1] = useState('');
  const [nome2, setNome2] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!nome1 || !nome2 || !email || !senha) {
        setError('Por favor, preencha todos os campos');
        return;
      }
      if (senha !== confirmSenha) {
        setError('As senhas não correspondem');
        return;
      }
      const tenant = await register(nome1, nome2, email, senha, true);
      onRegisterSuccess(tenant);
    } catch (err) {
      setError(err.message || 'Falha ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">💍</div>
            <h1 className="text-4xl font-display text-rose-gold mb-2">CasamentoForever</h1>
            <p className="text-body text-gray-600">Crie sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da primeira pessoa</label>
              <input
                type="text"
                value={nome1}
                onChange={(e) => setNome1(e.target.value)}
                placeholder="Ex: João"
                className="w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da segunda pessoa</label>
              <input
                type="text"
                value={nome2}
                onChange={(e) => setNome2(e.target.value)}
                placeholder="Ex: Maria"
                className="w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar senha</label>
              <input
                type="password"
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gold border-opacity-30 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/90 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button
                onClick={onLoginClick}
                className="text-gold font-semibold hover:text-rose-gold"
              >
                Entrar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
