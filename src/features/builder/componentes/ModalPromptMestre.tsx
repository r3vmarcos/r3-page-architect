import { Copy, X, Bot } from 'lucide-react'

// === MODAL PROMPT MESTRE | inicio ===
export function ModalPromptMestre(props: {
  aberto: boolean
  prompt: string
  modo: 'completo' | 'sem_estilos' | 'posicao'
  incluirInstrucoes: boolean
  onMudarModo: (m: 'completo' | 'sem_estilos' | 'posicao') => void
  onToggleInstrucoes: () => void
  onFechar: () => void
  onCopiar: () => void
}) {
  if (!props.aberto) return null

  return (
    <div className="fixed inset-0 z-[250] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="text-xs font-extrabold text-amber-300 flex items-center gap-2">
            <Bot className="w-4 h-4" /> Prompt mestre
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={props.onCopiar}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copiar
            </button>
            <button
              onClick={props.onFechar}
              className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-100 flex items-center justify-center"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3 border-b border-slate-800 flex flex-wrap items-center gap-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mr-2">Modo</div>

          <button
            onClick={() => props.onMudarModo('completo')}
            className={`px-3 py-2 rounded-xl border text-xs font-extrabold ${props.modo === 'completo' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-100 border-slate-800 hover:border-indigo-500'}`}
          >
            Completo (cores + bordas)
          </button>

          <button
            onClick={() => props.onMudarModo('sem_estilos')}
            className={`px-3 py-2 rounded-xl border text-xs font-extrabold ${props.modo === 'sem_estilos' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-100 border-slate-800 hover:border-indigo-500'}`}
          >
            Sem estilos (sem cores/bordas)
          </button>

          <button
            onClick={() => props.onMudarModo('posicao')}
            className={`px-3 py-2 rounded-xl border text-xs font-extrabold ${props.modo === 'posicao' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-100 border-slate-800 hover:border-indigo-500'}`}
          >
            Somente tamanho e posição
          </button>

<button
  onClick={props.onToggleInstrucoes}
  className={`px-3 py-2 rounded-xl border text-xs font-extrabold ${
    props.incluirInstrucoes ? 'bg-amber-500/20 text-amber-200 border-amber-500/40' : 'bg-slate-900 text-slate-100 border-slate-800 hover:border-amber-500'
  }`}
  title={props.incluirInstrucoes ? 'Instruções: ON' : 'Instruções: OFF'}
>
  Instruções
</button>

        </div>

        <textarea
          value={props.prompt}
          readOnly
          className="w-full h-[70vh] p-3 bg-slate-900 text-slate-100 text-xs font-mono outline-none resize-none"
        />
      </div>
    </div>
  )
}
// === MODAL PROMPT MESTRE | fim ===
