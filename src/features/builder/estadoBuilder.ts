import { create, type StoreApi } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CorAplicada, EstadoBuilder, TipoElemento, TipoPresetResolucao, TipoStack, ElementoBuilder } from '@/types/tiposBuilder'
import { clonarElementoBuilder, criarSnapshotBuilder, mesclarSnapshotBuilder, type SnapshotBuilder } from '@/features/builder/utils/layoutIO'

// === HELPERS BUILDER STORE | inicio ===
function gerarId(): string {
  return 'el_' + Math.random().toString(36).slice(2, 10)
}

const presets: Record<TipoPresetResolucao, { w: number; h: number; cols: number; rows: number }> = {
  'Desktop 1920x1080': { w: 1920, h: 1080, cols: 160, rows: 90 },
  'Notebook 1366x768': { w: 1366, h: 768, cols: 114, rows: 64 },
  'Tablet 1024x768': { w: 1024, h: 768, cols: 96, rows: 72 },
  'Tablet 834x1112': { w: 834, h: 1112, cols: 84, rows: 112 },
  'Mobile 390x844': { w: 390, h: 844, cols: 32, rows: 70 },
  'Mobile 360x800': { w: 360, h: 800, cols: 30, rows: 66 },
  'Ultrawide 2560x1080': { w: 2560, h: 1080, cols: 200, rows: 90 },
  'Ultrawide 3440x1440': { w: 3440, h: 1440, cols: 288, rows: 120 },
  '4K 3840x2160': { w: 3840, h: 2160, cols: 320, rows: 180 },
  Custom: { w: 1920, h: 1080, cols: 160, rows: 90 },
}

const tiposContainer: Set<TipoElemento> = new Set([
  'navbar','hero','secao','grid','card','sidebar','footer','modal','drawer','tabs','pricing','faq','galeria','lista','tabela',
  // HTML tags containers
  'tag_header',
  'tag_nav',
  'tag_main',
  'tag_section',
  'tag_article',
  'tag_aside',
  'tag_footer',
  'tag_div',
  'tag_ul',
  'tag_ol',
  'tag_dl',
  'tag_form',
  'tag_fieldset',
  'tag_table',
  'tag_thead',
  'tag_tbody',
  'tag_tfoot',
  'tag_tr',
  'tag_details',
  'tag_dialog',
  'tag_picture',
  'tag_figure',
  'tag_canvas',
  'tag_svg',
  'tag_template',
])

export function ehContainer(tipo: TipoElemento): boolean {
  return tiposContainer.has(tipo)
}

export function obterPreset(preset: TipoPresetResolucao) {
  return presets[preset]
}

function novoElemento(tipo: TipoElemento, paiId: string | null, xPct = 10, yPct = 10): ElementoBuilder {
  // === NOVO ELEMENTO | inicio ===
  const id = gerarId()
  const base: ElementoBuilder = {
    id,
    tipo,
    nomeCustom: '',
    descricao: '',
    paiId,

    // === POSICIONAMENTO LIVRE | inicio ===
    xPct,
    yPct,
    wPct: 5,
    hPct: 5,
    // === POSICIONAMENTO LIVRE | fim ===

    zIndex: 0,

    corBorda: { tokenTailwind: 'border-slate-300', hex: '#cbd5e1' },
    corTexto: { tokenTailwind: null, hex: 'inherit' },
    corFundo: { tokenTailwind: null, hex: 'transparent' },

    resizeTravado: false,
    proporcaoTravada: false,
    moverTravado: false,

    // === ESTILO AVANÇADO | inicio ===
    paddingPx: 0,
    gapPx: 0,
    borderWidthPx: 1,
    radiusPx: 0,
    opacity: 1,
    sombra: 'nenhuma',
    blurBackdrop: false,
    // === ESTILO AVANÇADO | fim ===

    // === MARGENS (PROMPT) | inicio ===
    margemAtiva: false,
    margemTopoPx: 0,
    margemBaixoPx: 0,
    margemEsqPx: 0,
    margemDirPx: 0,
    // === MARGENS (PROMPT) | fim ===

    // === INSTRUÇÕES (PROMPT) | inicio ===
    instrucoes: '',
    // === INSTRUÇÕES (PROMPT) | fim ===

    props: {},
  }


  // props úteis
  if (tipo === 'navbar') base.props = { logo: 'Logo', links: ['Início', 'Sobre', 'Contato'], cta: 'Login' }
  if (tipo === 'botao') base.props = { texto: 'Clique aqui', variante: 'primario' }
  if (tipo === 'titulo') base.props = { texto: 'Título', nivel: 1 }
  if (tipo === 'texto') base.props = { texto: 'Texto descritivo...' }

  return base
  // === NOVO ELEMENTO | fim ===
}
// === HELPERS BUILDER STORE | fim ===

type AcoesBuilder = {
  setStack: (stack: TipoStack) => void
  setPresetResolucao: (preset: TipoPresetResolucao) => void
  setResolucaoCustom: (parcial: Partial<EstadoBuilder['resolucao']>) => void

  setMagnetismoAtivo: (ativo: boolean) => void
  setAninharAtivo: (ativo: boolean) => void
  setBordaLocalizacaoAtiva: (ativo: boolean) => void

  selecionarElemento: (id: string | null) => void
  alternarSelecaoElemento: (id: string) => void
  selecionarElementos: (ids: string[]) => void
  adicionarElemento: (tipo: TipoElemento, paiId: string | null, xPct?: number, yPct?: number) => void
  removerElemento: (id: string) => void
  atualizarElemento: (id: string, parcial: Partial<ElementoBuilder>) => void
  duplicarElemento: (id: string) => string | null
  adicionarElementosEmLote: (elementos: ElementoBuilder[], elementoSelecionadoId?: string | null) => void
  substituirLayout: (snapshot: SnapshotBuilder) => void
  mesclarLayoutImportado: (snapshot: SnapshotBuilder) => void
  limparTudo: () => void
  trazerParaFrente: (id: string) => void
  enviarParaTras: (id: string) => void

  // === HISTÓRICO | inicio ===
  desfazer: () => void
  refazer: () => void
  podeDesfazer: () => boolean
  podeRefazer: () => boolean

  iniciarTransacaoHistorico: () => void
  finalizarTransacaoHistorico: () => void
  // === HISTÓRICO | fim ===
}

// === HISTÓRICO (UNDO/REDO) | inicio ===
const MAX_HISTORICO = 60

type SnapshotHistorico = Pick<EstadoBuilder, 'stack' | 'presetResolucao' | 'resolucao' | 'magnetismoAtivo' | 'aninharAtivo' | 'elementos' | 'elementoSelecionadoId'>

type EstadoHistorico = {
  historicoPassado: SnapshotHistorico[]
  historicoFuturo: SnapshotHistorico[]
}

function clonarElementosParaHistorico(elementos: ElementoBuilder[]): ElementoBuilder[] {
  return elementos.map((e) => ({
    ...e,
    corBorda: { ...e.corBorda },
    corTexto: { ...e.corTexto },
    corFundo: { ...e.corFundo },
    props: { ...(e.props ?? {}) },
  }))
}

function criarSnapshotHistorico(s: EstadoBuilder): SnapshotHistorico {
  return {
    stack: s.stack,
    presetResolucao: s.presetResolucao,
    resolucao: { ...s.resolucao },
    magnetismoAtivo: s.magnetismoAtivo,
    aninharAtivo: s.aninharAtivo,
    elementos: clonarElementosParaHistorico(s.elementos),
    elementoSelecionadoId: s.elementoSelecionadoId,
  }
}

function normalizarSelecao(snapshot: SnapshotHistorico): SnapshotHistorico {
  const ids = new Set(snapshot.elementos.map((e) => e.id))
  const sel = snapshot.elementoSelecionadoId
  return {
    ...snapshot,
    elementoSelecionadoId: sel && ids.has(sel) ? sel : null,
  }
}

function temMudancas(parcial: Partial<EstadoBuilder>) {
  return Object.keys(parcial).length > 0
}
// === HISTÓRICO (UNDO/REDO) | fim ===

const estadoInicial: EstadoBuilder = {
  stack: 'HTML + Tailwind',
  presetResolucao: 'Desktop 1920x1080',
  resolucao: { larguraPx: 1920, alturaPx: 1080, colunas: 160, linhas: 90, mostrarGrade: true },
  magnetismoAtivo: true,
  aninharAtivo: true,
  bordaLocalizacaoAtiva: true,
  elementos: [],
  elementoSelecionadoId: null,
  elementoSelecionadoIds: [],
}

export const useEstadoBuilder = create<EstadoBuilder & AcoesBuilder & EstadoHistorico>()(
  persist(
    (set, get) => {
      // === HISTÓRICO (helpers internos) | inicio ===
let transacaoAtiva = false
let snapshotTransacaoAntes: SnapshotHistorico | null = null
let transacaoAlterou = false

const iniciarTransacaoHistorico = () => {
  if (transacaoAtiva) return
  transacaoAtiva = true
  snapshotTransacaoAntes = normalizarSelecao(criarSnapshotHistorico(get() as any))
  transacaoAlterou = false
}

const finalizarTransacaoHistorico = () => {
  if (!transacaoAtiva) return
  if (snapshotTransacaoAntes && transacaoAlterou) {
    set((s: any) => {
      const passado = [...(s.historicoPassado as SnapshotHistorico[]), snapshotTransacaoAntes as SnapshotHistorico].slice(-MAX_HISTORICO)
      return { historicoPassado: passado, historicoFuturo: [] }
    })
  }
  transacaoAtiva = false
  snapshotTransacaoAntes = null
  transacaoAlterou = false
}

const aplicarComHistorico = (fn: (s: EstadoBuilder) => Partial<EstadoBuilder>) => {
  if (transacaoAtiva) {
    set((s: any) => {
      const parcial = fn(s as EstadoBuilder)
      if (!temMudancas(parcial)) return {}
      transacaoAlterou = true
      return parcial
    })
    return
  }

  const antes = normalizarSelecao(criarSnapshotHistorico(get() as any))
  set((s: any) => {
    const parcial = fn(s as EstadoBuilder)
    if (!temMudancas(parcial)) return {}
    const passado = [...(s.historicoPassado as SnapshotHistorico[]), antes].slice(-MAX_HISTORICO)
    return { ...parcial, historicoPassado: passado, historicoFuturo: [] }
  })
}
// === HISTÓRICO (helpers internos) | fim ===


      return ({
        ...estadoInicial,
        historicoPassado: [],
        historicoFuturo: [],

        iniciarTransacaoHistorico: () => iniciarTransacaoHistorico(),
        finalizarTransacaoHistorico: () => finalizarTransacaoHistorico(),

      // === AÇÕES | inicio ===
      setStack: (stack) => aplicarComHistorico(() => ({ stack })),

      setPresetResolucao: (preset) => {
        if (preset === 'Custom') {
          aplicarComHistorico(() => ({ presetResolucao: 'Custom' }))
          return
        }
        const p = obterPreset(preset)
        aplicarComHistorico(() => ({
          presetResolucao: preset,
          resolucao: {
            larguraPx: p.w,
            alturaPx: p.h,
            colunas: p.cols,
            linhas: p.rows,
            mostrarGrade: true,
          },
        }))
      },

      setResolucaoCustom: (parcial) =>
        aplicarComHistorico((s) => ({
          resolucao: { ...s.resolucao, ...parcial },
          presetResolucao: 'Custom',
        })),

      setMagnetismoAtivo: (ativo) => aplicarComHistorico(() => ({ magnetismoAtivo: ativo })),
      setAninharAtivo: (ativo) => aplicarComHistorico(() => ({ aninharAtivo: ativo })),
      setBordaLocalizacaoAtiva: (ativo) => set({ bordaLocalizacaoAtiva: ativo }),

      selecionarElemento: (id) => set({ elementoSelecionadoId: id, elementoSelecionadoIds: id ? [id] : [] }),
      alternarSelecaoElemento: (id) =>
        set((s: any) => {
          const atual: string[] = Array.isArray(s.elementoSelecionadoIds) ? s.elementoSelecionadoIds : []
          const ids = atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
          return { elementoSelecionadoIds: ids, elementoSelecionadoId: ids[ids.length - 1] ?? null }
        }),
      selecionarElementos: (ids) => set({ elementoSelecionadoIds: ids, elementoSelecionadoId: ids[ids.length - 1] ?? null }),

      adicionarElemento: (tipo, paiId, xPct, yPct) =>
        aplicarComHistorico((s) => ({
          elementos: [...s.elementos, novoElemento(tipo, paiId, xPct ?? 10, yPct ?? 10)],
        })),

      removerElemento: (id) =>
        aplicarComHistorico((s) => {
          const alvo = s.elementos.find((e) => e.id === id)
          if (!alvo) return {}

          const paiId = alvo.paiId

          const elementosAtualizados = s.elementos
            .filter((e) => e.id !== id)
            .map((e) => {
              if (e.paiId !== id) return e

              // === REPARA HIERARQUIA AO REMOVER | inicio ===
              // Ao remover um container, os filhos NÃO são apagados.
              // Eles são "promovidos" para o pai do elemento removido,
              // mantendo posição e tamanho em coordenadas do pai.
              const novoXPct = alvo.xPct + (e.xPct / 100) * alvo.wPct
              const novoYPct = alvo.yPct + (e.yPct / 100) * alvo.hPct
              const novoWPct = (e.wPct / 100) * alvo.wPct
              const novoHPct = (e.hPct / 100) * alvo.hPct

              return {
                ...e,
                paiId,
                xPct: novoXPct,
                yPct: novoYPct,
                wPct: novoWPct,
                hPct: novoHPct,
              }
              // === REPARA HIERARQUIA AO REMOVER | fim ===
            })

          const selecionado = s.elementoSelecionadoId === id ? null : s.elementoSelecionadoId
          return { elementos: elementosAtualizados, elementoSelecionadoId: selecionado }
        }),


      atualizarElemento: (id, parcial) =>
        aplicarComHistorico((s) => ({ elementos: s.elementos.map((e) => (e.id === id ? { ...e, ...parcial } : e)) })),


duplicarElemento: (id: string) => {
  let idDuplicado: string | null = null
  aplicarComHistorico((s) => {
    const raiz = s.elementos.find((e) => e.id === id)
    if (!raiz) return {}

    // === COLETAR SUBÁRVORE | inicio ===
    const filhosPorPai = new Map<string, ElementoBuilder[]>()
    s.elementos.forEach((e) => {
      const key = e.paiId ?? '__root__'
      const lista = filhosPorPai.get(key) ?? []
      lista.push(e)
      filhosPorPai.set(key, lista)
    })

    function coletar(idPai: string, acc: ElementoBuilder[]) {
      const lista = filhosPorPai.get(idPai) ?? []
      lista.forEach((f) => {
        acc.push(f)
        coletar(f.id, acc)
      })
    }

    const sub: ElementoBuilder[] = []
    coletar(raiz.id, sub)
    // === COLETAR SUBÁRVORE | fim ===

    const todos = [raiz, ...sub]

    const mapaIds = new Map<string, string>()
    todos.forEach((e) => mapaIds.set(e.id, gerarId()))

    const novoIdRaiz = mapaIds.get(raiz.id) as string
    idDuplicado = novoIdRaiz

    // deslocamento leve para não ficar em cima
    const dx = 1.5
    const dy = 1.5

    const clones = todos.map((e) => {
      const novoId = mapaIds.get(e.id) as string
      const paiNovo =
        e.id === raiz.id
          ? raiz.paiId // mantém o mesmo pai da raiz
          : mapaIds.get(e.paiId as string) ?? e.paiId

      const clone: ElementoBuilder = {
        ...e,
        id: novoId,
        paiId: paiNovo,
        xPct: e.id === raiz.id ? Math.max(0, Math.min(100 - e.wPct, e.xPct + dx)) : e.xPct,
        yPct: e.id === raiz.id ? Math.max(0, Math.min(100 - e.hPct, e.yPct + dy)) : e.yPct,
        zIndex: e.zIndex, // herda
      }
      return clone
    })

    return {
      elementos: [...s.elementos, ...clones],
      elementoSelecionadoId: novoIdRaiz,
      elementoSelecionadoIds: [novoIdRaiz],
    }
  })
  return idDuplicado
},

      adicionarElementosEmLote: (elementosNovos, novoSelecionadoId = null) =>
        aplicarComHistorico((s) => {
          if (elementosNovos.length === 0) return {}
          return {
            elementos: [...s.elementos, ...elementosNovos.map((elemento) => clonarElementoBuilder(elemento))],
            elementoSelecionadoId: novoSelecionadoId ?? s.elementoSelecionadoId,
          }
        }),

      substituirLayout: (snapshot) =>
        aplicarComHistorico(() => criarSnapshotBuilder(snapshot)),

      mesclarLayoutImportado: (snapshot) =>
        aplicarComHistorico((s) => mesclarSnapshotBuilder(criarSnapshotBuilder(s), snapshot)),

      trazerParaFrente: (id: string) =>
        aplicarComHistorico((s) => ({ elementos: s.elementos.map((e) => (e.id === id ? { ...e, zIndex: 15 } : e)) })),

      enviarParaTras: (id: string) =>
        aplicarComHistorico((s) => ({ elementos: s.elementos.map((e) => (e.id === id ? { ...e, zIndex: -5 } : e)) })),

      limparTudo: () => aplicarComHistorico(() => ({ ...estadoInicial })),
      // === HISTÓRICO (ações) | inicio ===
      podeDesfazer: () => get().historicoPassado.length > 0,
      podeRefazer: () => get().historicoFuturo.length > 0,

      desfazer: () => {
        const s: any = get()
        const passado: SnapshotHistorico[] = s.historicoPassado ?? []
        if (passado.length === 0) return
        const atual = normalizarSelecao(criarSnapshotHistorico(s))
        const anterior = passado[passado.length - 1]
        const novoPassado = passado.slice(0, -1)
        const novoFuturo = [...(s.historicoFuturo ?? []), atual].slice(-MAX_HISTORICO)
        const aplicado = normalizarSelecao(anterior)
        set({
          ...aplicado,
          historicoPassado: novoPassado,
          historicoFuturo: novoFuturo,
        } as any)
      },

      refazer: () => {
        const s: any = get()
        const futuro: SnapshotHistorico[] = s.historicoFuturo ?? []
        if (futuro.length === 0) return
        const atual = normalizarSelecao(criarSnapshotHistorico(s))
        const proximo = futuro[futuro.length - 1]
        const novoFuturo = futuro.slice(0, -1)
        const novoPassado = [...(s.historicoPassado ?? []), atual].slice(-MAX_HISTORICO)
        const aplicado = normalizarSelecao(proximo)
        set({
          ...aplicado,
          historicoPassado: novoPassado,
          historicoFuturo: novoFuturo,
        } as any)
      },
      // === HISTÓRICO (ações) | fim ===

      // === AÇÕES | fim ===
      })
    },
    {
      name: 'arquiteto_web_react_builder_v2',
      version: 8,
      migrate: (persisted: any) => {
        const s = persisted ?? {}
        const elementos = Array.isArray(s.elementos) ? s.elementos : []
        const migrados = elementos.map((e: any) => ({
          ...e,
          nomeCustom: typeof e.nomeCustom === 'string' ? e.nomeCustom : '',
          descricao: typeof e.descricao === 'string' ? e.descricao : '',
          zIndex: typeof e.zIndex === 'number' ? e.zIndex : 0,
          resizeTravado: !!e.resizeTravado,
          proporcaoTravada: !!e.proporcaoTravada,
          moverTravado: !!e.moverTravado,
          props: e.props ?? {},
          paddingPx: typeof e.paddingPx === 'number' ? e.paddingPx : 0,
          gapPx: typeof e.gapPx === 'number' ? e.gapPx : 0,
          borderWidthPx: typeof e.borderWidthPx === 'number' ? e.borderWidthPx : 0,
          radiusPx: 0,
          opacity: typeof e.opacity === 'number' ? e.opacity : 1,
          sombra: (e.sombra === 'nenhuma' || e.sombra === 'sm' || e.sombra === 'md' || e.sombra === 'lg') ? e.sombra : 'md',
          blurBackdrop: !!e.blurBackdrop,
          margemAtiva: !!e.margemAtiva,
          margemTopoPx: typeof e.margemTopoPx === 'number' ? e.margemTopoPx : 0,
          margemBaixoPx: typeof e.margemBaixoPx === 'number' ? e.margemBaixoPx : 0,
          margemEsqPx: typeof e.margemEsqPx === 'number' ? e.margemEsqPx : 0,
          margemDirPx: typeof e.margemDirPx === 'number' ? e.margemDirPx : 0,
          instrucoes: typeof e.instrucoes === 'string' ? e.instrucoes : '',
        }))
        const idsElementos = new Set(migrados.map((e: any) => e.id))
        const idsSelecionados = Array.isArray(s.elementoSelecionadoIds) ? s.elementoSelecionadoIds.filter((id: any) => typeof id === 'string' && idsElementos.has(id)) : []
        const selecionado = typeof s.elementoSelecionadoId === 'string' && idsElementos.has(s.elementoSelecionadoId) ? s.elementoSelecionadoId : (idsSelecionados[idsSelecionados.length - 1] ?? null)
        return { ...s, bordaLocalizacaoAtiva: true, elementos: migrados, elementoSelecionadoId: selecionado, elementoSelecionadoIds: idsSelecionados.length ? idsSelecionados : (selecionado ? [selecionado] : []) }
      },
      partialize: (s) => ({
        stack: s.stack,
        presetResolucao: s.presetResolucao,
        resolucao: s.resolucao,
        magnetismoAtivo: s.magnetismoAtivo,
        aninharAtivo: s.aninharAtivo,
        bordaLocalizacaoAtiva: s.bordaLocalizacaoAtiva,
        elementos: s.elementos,
        elementoSelecionadoId: s.elementoSelecionadoId,
        elementoSelecionadoIds: s.elementoSelecionadoIds,
      }),
    },
  ),
)

// === API ZUSTAND (GET/SET) | inicio ===
export const apiEstadoBuilder: Pick<StoreApi<EstadoBuilder & AcoesBuilder>, 'getState' | 'setState' | 'subscribe'> = {
  getState: useEstadoBuilder.getState,
  setState: useEstadoBuilder.setState,
  subscribe: useEstadoBuilder.subscribe,
}
// === API ZUSTAND (GET/SET) | fim ===

// === REALTIME BRIDGE (BUILDER <-> MONITOR) | inicio ===
// Objetivo: /viewpage (Monitor) atualizar SEMPRE em tempo real.
// Estratégias (por ordem):
// 01) BroadcastChannel (mesma origem)
// 02) localStorage snapshot + 'pulse' (mesma origem) + polling do Monitor
// 03) postMessage (se o Monitor foi aberto pelo Builder via window.open)

type SnapshotRealtime = Pick<
  EstadoBuilder,
  'stack' | 'presetResolucao' | 'resolucao' | 'magnetismoAtivo' | 'aninharAtivo' | 'elementos' | 'elementoSelecionadoId'
>

const NOME_CANAL_REALTIME = 'page_architect_realtime_v2'
const KEY_SNAPSHOT = 'page_architect_realtime_snapshot_v2'
const KEY_PULSE = 'page_architect_realtime_pulse_v2'

function montarSnapshotRealtime(s: EstadoBuilder): SnapshotRealtime {
  return {
    stack: s.stack,
    presetResolucao: s.presetResolucao,
    resolucao: s.resolucao,
    magnetismoAtivo: s.magnetismoAtivo,
    aninharAtivo: s.aninharAtivo,
    elementos: s.elementos,
    elementoSelecionadoId: s.elementoSelecionadoId,
  }
}

function persistirSnapshot(snapshot: SnapshotRealtime) {
  try {
    localStorage.setItem(KEY_SNAPSHOT, JSON.stringify(snapshot))
    localStorage.setItem(KEY_PULSE, String(Date.now()))
  } catch {}
}

function iniciarBridgeRealtime() {
  if (typeof window === 'undefined') return

  const ehMonitor = window.location.pathname === '/viewpage'

  // === BUILDER | inicio ===
  if (!ehMonitor) {
    // BroadcastChannel (se disponível)
    let canal: BroadcastChannel | null = null
    if (typeof window.BroadcastChannel !== 'undefined') {
      canal = new BroadcastChannel(NOME_CANAL_REALTIME)
      canal.onmessage = (ev) => {
        const data = ev.data
        if (!data) return
        if (data.tipo === 'request_snapshot') {
          const snap = montarSnapshotRealtime(useEstadoBuilder.getState())
          try {
            canal?.postMessage({ tipo: 'snapshot', payload: snap })
          } catch {}
        }
      }
    }

    // postMessage: responder pedidos do Monitor
    window.addEventListener('message', (ev) => {
      try {
        const data = ev.data
        if (!data) return
        if (data.tipo !== 'request_snapshot') return
        const snap = montarSnapshotRealtime(useEstadoBuilder.getState())
        ;(ev.source as any)?.postMessage({ tipo: 'snapshot', payload: snap }, '*')
      } catch {}
    })

    // Publica qualquer alteração (throttle)
    let timer: number | null = null
    let pendente: SnapshotRealtime | null = null

    function emitir(snapshot: SnapshotRealtime) {
      persistirSnapshot(snapshot)
      try {
        canal?.postMessage({ tipo: 'snapshot', payload: snapshot })
      } catch {}

      // se tiver monitor aberto via opener, tenta enviar também
      try {
        if ((window as any).__monitorRef && !(window as any).__monitorRef.closed) {
          ;(window as any).__monitorRef.postMessage({ tipo: 'snapshot', payload: snapshot }, '*')
        }
      } catch {}
    }

    function agendar(snapshot: SnapshotRealtime) {
      pendente = snapshot
      if (timer) return
      timer = window.setTimeout(() => {
        if (pendente) emitir(pendente)
        pendente = null
        timer = null
      }, 60)
    }

    useEstadoBuilder.subscribe((s) => {
      agendar(montarSnapshotRealtime(s))
    })

    // Emissão inicial
    agendar(montarSnapshotRealtime(useEstadoBuilder.getState()))
  }
  // === BUILDER | fim ===
}

iniciarBridgeRealtime()
// === REALTIME BRIDGE (BUILDER <-> MONITOR) | fim ===
