import { useMemo, useState } from 'react'
import { Copy, Search } from 'lucide-react'
import { catalogoPro, catalogoReact, type ItemCatalogo } from './datasets'
import { useEstadoBuilder } from '@/features/builder/estadoBuilder'

// === CATÁLOGO PAGE | inicio ===
export function CatalogoPage(props: { tipo: 'pro' | 'react' }) {
  const { stack } = useEstadoBuilder()
  const [busca, setBusca] = useState('')

  const dados = props.tipo === 'pro' ? catalogoPro : catalogoReact

  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return dados
    return dados.filter((i) => (i.nome + ' ' + i.descricao + ' ' + i.prompt).toLowerCase().includes(t))
  }, [busca, dados])

  function montarPrompt(item: ItemCatalogo) {
    return `[CONTEXTO TECNOLÓGICO: usar a stack: ${stack}]

Instrução Principal:
${item.prompt}`
  }

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = texto
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }

  return (
    <div className="h-full w-full overflow-auto">
      <div className="max-w-6xl mx-auto px-3 py-4">
      {/* === CABEÇALHO | inicio === */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>
          <div className="text-xl font-extrabold text-white">
            {props.tipo === 'pro' ? 'Catálogo Pro' : 'Catálogo React'}
          </div>
          <div className="text-sm text-slate-400">
            {props.tipo === 'pro'
              ? 'Modelos prontos para HTML/CSS/frameworks.'
              : 'Modelos prontos para componentes React + TypeScript.'}
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar no catálogo..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      {/* === CABEÇALHO | fim === */}

      <div className="mt-4 grid grid-cols-1 gap-4">
        {lista.map((item) => {
          const prompt = montarPrompt(item)
          return (
            <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-extrabold">{item.nome}</div>
                  <div className="text-slate-400 text-sm">{item.descricao}</div>
                </div>
                <button
                  onClick={() => copiar(prompt)}
                  className="shrink-0 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copiar
                </button>
              </div>

              <div className="border-t border-slate-800 grid grid-cols-1 lg:grid-cols-[320px_1fr]">
                {/* === PREVIEW | inicio === */}
                <div className="p-4 bg-slate-950/30">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">Preview</div>
                  <div className="rounded-xl bg-white border border-slate-200 p-4 min-h-[160px] text-slate-900">
                    {item.previewTipo === 'html' && item.previewHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: item.previewHtml }} />
                    ) : (
                      <div className="space-y-2">
                        {(item.previewBlocos ?? []).map((b, idx) => {
                          if (b.tipo === 'barra') {
                            return (
                              <div
                                key={idx}
                                className={
                                  'h-8 rounded-lg border flex items-center px-3 text-xs font-bold ' +
                                  (b.destaque ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-700')
                                }
                              >
                                {b.label ?? 'Barra'}
                              </div>
                            )
                          }
                          if (b.tipo === 'card') {
                            return (
                              <div key={idx} className="h-12 rounded-lg border border-slate-200 bg-white shadow-sm flex items-center px-3 text-xs">
                                {b.label ?? 'Card'}
                              </div>
                            )
                          }
                          if (b.tipo === 'linha') {
                            return (
                              <div key={idx} className="h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center px-3 text-xs">
                                {b.label ?? 'Linha'}
                              </div>
                            )
                          }
                          if (b.tipo === 'badge') {
                            return (
                              <div key={idx} className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                {b.label ?? 'Badge'}
                              </div>
                            )
                          }
                          if (b.tipo === 'input') {
                            return <div key={idx} className="h-9 rounded-lg border border-slate-200 bg-white" />
                          }
                          if (b.tipo === 'imagem') {
                            return <div key={idx} className="h-20 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-xs text-slate-500">Imagem</div>
                          }
                          if (b.tipo === 'botao') {
                            return (
                              <button key={idx} className={'px-3 py-2 rounded-lg text-xs font-bold ' + (b.destaque ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800')}>
                                {b.label ?? 'Botão'}
                              </button>
                            )
                          }
                          return (
                            <div key={idx} className="text-xs text-slate-600">
                              {b.label ?? 'Bloco'}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
                {/* === PREVIEW | fim === */}

                {/* === PROMPT | inicio === */}
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">Prompt</div>
                  <pre className="whitespace-pre-wrap text-xs font-mono text-slate-200 bg-slate-950 border border-slate-800 rounded-xl p-3 min-h-[160px]">
                    {prompt}
                  </pre>
                </div>
                {/* === PROMPT | fim === */}
              </div>
            </div>
          )
        })}
      </div>

      {lista.length === 0 ? (
        <div className="mt-10 text-center text-slate-400">Nenhum item encontrado.</div>
      ) : null}
    </div>
  </div>
  )
}

// === CATÁLOGO PAGE | fim ===
