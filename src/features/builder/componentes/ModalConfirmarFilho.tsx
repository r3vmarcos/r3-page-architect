import { X, CornerDownRight } from 'lucide-react'

// === MODAL CONFIRMAR FILHO | inicio ===
export function ModalConfirmarFilho(props: {
  aberto: boolean
  titulo: string
  descricao: string
  onSim: () => void
  onNao: () => void
}) {
  if (!props.aberto) return null

  return (
    <div className="fixed inset-0 z-[240] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="text-xs font-extrabold text-indigo-200 flex items-center gap-2">
            <CornerDownRight className="w-4 h-4" /> Adicionar componente filho
          </div>
          <button
            onClick={props.onNao}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-100 flex items-center justify-center"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <div className="text-white font-extrabold">{props.titulo}</div>
          <div className="text-sm text-slate-300">{props.descricao}</div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              onClick={props.onNao}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-100 text-xs font-extrabold"
            >
              Não
            </button>
            <button
              onClick={props.onSim}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold"
            >
              Sim
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
// === MODAL CONFIRMAR FILHO | fim ===
