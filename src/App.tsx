import { useEffect, useState } from 'react'
import { fetchHello } from './lib/api'

function App() {
  const [message, setMessage] = useState('Carregando mensagem...')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHello()
      .then((data) => {
        setMessage(data.message ?? 'Olá do CasamentoForever!')
      })
      .catch((err) => {
        setError(err?.message ?? 'Erro ao buscar mensagem')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--primary)_0%,_rgba(59,130,246,0.08)_35%,_rgba(239,246,255,1)_100%)] text-foreground px-safe pt-safe pb-safe">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-4 py-8 sm:px-6">
        <section className="rounded-[28px] border border-border bg-card/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                💍
              </div>
              <div>
                <h1 className="text-2xl font-semibold">CasamentoForever</h1>
                <p className="text-sm text-muted-foreground">Hello world com Turso + mobile friendly.</p>
              </div>
            </div>
            <div className="rounded-3xl bg-secondary p-5 text-secondary-foreground shadow-sm shadow-slate-900/5">
              <p className="text-base leading-7">Este exemplo usa uma API local que se conecta ao Turso Database usando <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-sm text-slate-700">@libsql/client</code>.</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-card p-5 text-card-foreground shadow-sm shadow-slate-900/5">
                <strong className="block text-sm uppercase tracking-[0.18em] text-slate-500">Mensagem</strong>
                {loading ? (
                  <p className="mt-3 text-base">Carregando...</p>
                ) : error ? (
                  <p className="mt-3 text-base text-destructive">{error}</p>
                ) : (
                  <p className="mt-3 text-lg font-medium text-slate-950">{message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-[22px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Atualizar mensagem
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
