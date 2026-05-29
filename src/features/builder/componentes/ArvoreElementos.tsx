import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { useEstadoBuilder } from '../estadoBuilder'
import type { ElementoBuilder } from '@/types/tiposBuilder'

// === ÁRVORE ELEMENTOS | inicio ===
export function ArvoreElementos(props: { compacta?: boolean }) {
  const { elementos, elementoSelecionadoId, selecionarElemento } = useEstadoBuilder()

  const filhosPorPai = useMemo(() => {
    const map = new Map<string | null, ElementoBuilder[]>()
    elementos.forEach((e) => {
      const key = e.paiId ?? null
      const lista = map.get(key) ?? []
      lista.push(e)
      map.set(key, lista)
    })
    // ordena por z-index e depois por y
    map.forEach((lista) => {
      lista.sort((a, b) => (a.zIndex - b.zIndex) || (a.yPct - b.yPct) || (a.xPct - b.xPct))
    })
    return map
  }, [elementos])

  function rotulo(el: ElementoBuilder) {
    if (el.descricao?.trim()) return el.descricao.trim()
    if (el.nomeCustom?.trim()) return `.${el.nomeCustom.trim()}`
    if (el.tipo.startsWith('tag_')) return `<${el.tipo.replace('tag_', '')}>`
    return el.tipo
  }

  function renderNo(paiId: string | null, nivel: number) {
    const filhos = filhosPorPai.get(paiId) ?? []
    if (!filhos.length) return null

    return (
      <div className="space-y-1">
        {filhos.map((el) => {
          const selecionado = el.id === elementoSelecionadoId
          return (
            <div key={el.id}>
              <button
                onClick={() => selecionarElemento(el.id)}
                className={
                  'w-full flex items-center gap-2 px-2 py-1 rounded-lg border text-left ' +
                  (selecionado ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600')
                }
                style={{ marginLeft: props.compacta ? nivel * 10 : nivel * 14 }}
                title={rotulo(el)}
              >
                <ChevronRight className="w-3 h-3 opacity-60" />
                <span className="text-[11px] font-extrabold truncate">{rotulo(el)}</span>
                <span className="ml-auto text-[10px] text-slate-500 font-mono">
                  z-index-{el.zIndex}
                </span>
              </button>

              {renderNo(el.id, nivel + 1)}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 rounded-2xl bg-slate-950 border border-slate-800 p-2 flex flex-col">
      <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Árvore</div>
      <div className="mt-1 flex-1 min-h-0 overflow-y-auto overflow-x-auto pr-1">{renderNo(null, 0)}</div>
    </div>
  )
}
// === ÁRVORE ELEMENTOS | fim ===
