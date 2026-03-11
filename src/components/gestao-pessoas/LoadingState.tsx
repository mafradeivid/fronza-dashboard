interface LoadingStateProps {
  mensagem?: string
  cor?: 'blue' | 'emerald' | 'amber' | 'violet' | 'purple'
}

export function LoadingState({ mensagem = 'Carregando...', cor = 'blue' }: LoadingStateProps) {
  const cores = {
    blue: 'border-blue-200 border-blue-600',
    emerald: 'border-emerald-200 border-emerald-600',
    amber: 'border-amber-200 border-amber-600',
    violet: 'border-violet-200 border-violet-600',
    purple: 'border-purple-200 border-purple-600',
  }

  const [corFundo, corSpinner] = cores[cor].split(' ')

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className={`absolute inset-0 rounded-full border-4 ${corFundo}`}></div>
          <div className={`absolute inset-0 rounded-full border-4 ${corSpinner} border-t-transparent animate-spin`}></div>
        </div>
        <p className="text-slate-600 font-medium">{mensagem}</p>
      </div>
    </div>
  )
}