import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Bot, MousePointerClick, Trash2, Upload, Download, Save } from 'lucide-react'
import { useEstadoBuilder, ehContainer } from '@/features/builder/estadoBuilder'
import { clonarClipboardNaPosicao, coletarSubarvoreBuilder, criarArquivoLayout, criarSnapshotBuilder, extrairSnapshotBuilder, mesclarSnapshotBuilder, type ClipboardElementos } from '@/features/builder/utils/layoutIO'
import { obterSombraBuilder } from '@/features/builder/utils/renderBuilder'
import type { ElementoBuilder, TipoElemento } from '@/types/tiposBuilder'
import { ModalPromptMestre } from './ModalPromptMestre'
import { ModalConfirmarFilho } from './ModalConfirmarFilho'

// === HELPERS CANVAS | inicio ===
type Retangulo = { left: number; top: number; right: number; bottom: number; width: number; height: number }

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function pct(n: number) {
  return `${n}%`
}

function obterCentro(r: Retangulo) {
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }
}

function calcularFit(availW: number, availH: number, aspecto: number) {
  const wPorAltura = availH * aspecto
  const width = Math.min(availW, wPorAltura)
  const height = width / aspecto
  return { width, height }
}

function rectDoCanvas() {
  const canvas = document.querySelector('[data-canvas-root="1"]') as HTMLElement | null
  return canvas?.getBoundingClientRect() ?? null
}

function rectDoElemento(id: string) {
  const el = document.querySelector(`[data-elemento-id="${id}"]`) as HTMLElement | null
  return el?.getBoundingClientRect() ?? null
}

function ehDescendente(idOrigem: string, idCandidatoPai: string, mapa: Map<string, ElementoBuilder>) {
  let atual: string | null = idCandidatoPai
  while (atual) {
    if (atual === idOrigem) return true
    const el = mapa.get(atual)
    atual = el?.paiId ?? null
  }
  return false
}

function encontrarContainerMaisProfundoPorPonto(
  cx: number,
  cy: number,
  idIgnorar: string,
  mapa: Map<string, ElementoBuilder>,
): string | null {
  // === BUSCA POR RETÂNGULOS (ESTÁVEL) | inicio ===
  // Não depende de elementsFromPoint (que muda com z-index).
  const candidatos: Array<{ id: string; area: number }> = []

  for (const e of mapa.values()) {
    if (e.id === idIgnorar) continue
    if (!ehContainer(e.tipo)) continue
    if (ehDescendente(idIgnorar, e.id, mapa)) continue

    const r = rectDoElemento(e.id)
    if (!r) continue

    const dentro = cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom
    if (!dentro) continue

    candidatos.push({ id: e.id, area: r.width * r.height })
  }

  if (candidatos.length === 0) return null
  candidatos.sort((a, b) => a.area - b.area) // menor = mais profundo
  return candidatos[0].id
  // === BUSCA POR RETÂNGULOS (ESTÁVEL) | fim ===
}
// === HELPERS CANVAS | fim ===

// === TIPOS MENU CONTEXTO | inicio ===
type MenuContexto = {
  id: string | null
  x: number
  y: number
  xPct: number
  yPct: number
}
// === TIPOS MENU CONTEXTO | fim ===

// === SLOTS SAVE | inicio ===
const TOTAL_SLOTS = 10
const KEY_SLOT_ATIVO = 'page_architect_slot_ativo_v2'
const KEY_SLOT_PREFIX = 'page_architect_slot_v1_'

type ArquivoSlot = {
  versao: 'slot_v2'
  nome: string
  salvoEm: string | null
  payload: ReturnType<typeof criarSnapshotBuilder>
}

type MenuSlot = {
  indice: number
  x: number
  y: number
} | null
// === SLOTS SAVE | fim ===

type SelecaoArrasto = {
  startX: number
  startY: number
  x: number
  y: number
}

// === CANVAS | inicio ===
export function Canvas(props: { onObterTamanhoPx: (w: number, h: number) => void }) {
  const {
    stack,
    presetResolucao,
    resolucao,
    elementos,
    elementoSelecionadoId,
    elementoSelecionadoIds,
    selecionarElemento,
    alternarSelecaoElemento,
    selecionarElementos,
    adicionarElemento,
    removerElemento,
    atualizarElemento,
    duplicarElemento,
    adicionarElementosEmLote,
    substituirLayout,
    mesclarLayoutImportado,
    limparTudo,
    iniciarTransacaoHistorico,
    finalizarTransacaoHistorico,
    magnetismoAtivo,
    aninharAtivo,
    bordaLocalizacaoAtiva,
  } = useEstadoBuilder()

  // === ESTADO UI | inicio ===
  const [promptAberto, setPromptAberto] = useState(false)
  const [prompt, setPrompt] = useState<string>('')
  const [modoPrompt, setModoPrompt] = useState<'completo' | 'sem_estilos' | 'posicao'>('completo')
  const [incluirInstrucoes, setIncluirInstrucoes] = useState(true)

// === PROMPT (REGERAR AO TROCAR MODO) | inicio ===
useEffect(() => {
  if (!promptAberto) return
  setPrompt(gerarPromptMestre(modoPrompt, incluirInstrucoes))
}, [modoPrompt, incluirInstrucoes, promptAberto, elementos, resolucao, stack])
// === PROMPT (REGERAR AO TROCAR MODO) | fim ===


  const [menuContexto, setMenuContexto] = useState<MenuContexto | null>(null)
  const [clipboard, setClipboard] = useState<ClipboardElementos | null>(null)
  const [layoutAberto, setLayoutAberto] = useState(false)
  const [layoutModo, setLayoutModo] = useState<'substituir' | 'mesclar'>('substituir')

// === SLOTS (salvar/carregar no localStorage) | inicio ===
const [slotAtivo, setSlotAtivo] = useState<number>(() => {
  const raw = localStorage.getItem(KEY_SLOT_ATIVO)
  const n = raw ? Number(raw) : 1
  return Number.isFinite(n) && n >= 1 && n <= TOTAL_SLOTS ? n : 1
})
const [versaoSlots, setVersaoSlots] = useState(0)
const [menuSlot, setMenuSlot] = useState<MenuSlot>(null)
const [confirmLimparSlot, setConfirmLimparSlot] = useState<number | null>(null)
const slotsInicializadosRef = useRef(false)

function snapshotAtual() {
  return criarSnapshotBuilder({
    stack,
    presetResolucao,
    resolucao,
    magnetismoAtivo,
    aninharAtivo,
    elementos,
    elementoSelecionadoId,
  })
}

function criarSlotVazio(indice: number): ArquivoSlot {
  return {
    versao: 'slot_v2',
    nome: String(indice),
    salvoEm: null,
    payload: criarSnapshotBuilder({
      stack: 'HTML + Tailwind',
      presetResolucao: 'Desktop 1920x1080',
      resolucao: { larguraPx: 1920, alturaPx: 1080, colunas: 160, linhas: 90, mostrarGrade: true },
      magnetismoAtivo: true,
      aninharAtivo: true,
      elementos: [],
      elementoSelecionadoId: null,
    }),
  }
}

function lerSlot(indice: number): ArquivoSlot | null {
  const raw = localStorage.getItem(KEY_SLOT_PREFIX + indice)
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    const payload = extrairSnapshotBuilder(data)
    if (!payload) return null
    return {
      versao: 'slot_v2',
      nome: typeof data?.nome === 'string' && data.nome.trim() ? data.nome.trim() : String(indice),
      salvoEm: typeof data?.salvoEm === 'string' ? data.salvoEm : null,
      payload,
    }
  } catch {
    return null
  }
}

function escreverSlot(indice: number, arquivo: ArquivoSlot) {
  localStorage.setItem(KEY_SLOT_PREFIX + indice, JSON.stringify(arquivo))
  setVersaoSlots((v) => v + 1)
}

function salvarNoSlot(indice = slotAtivo) {
  const anterior = lerSlot(indice)
  escreverSlot(indice, {
    versao: 'slot_v2',
    nome: anterior?.nome ?? String(indice),
    salvoEm: new Date().toISOString(),
    payload: snapshotAtual(),
  })
  copiarToast(`Slot ${indice} salvo!`)
}

function carregarDoSlot(indice: number) {
  const existente = lerSlot(indice)
  const slot = existente ?? criarSlotVazio(indice)
  if (!existente) escreverSlot(indice, slot)
  substituirLayout(slot.payload)
  setSlotAtivo(indice)
  localStorage.setItem(KEY_SLOT_ATIVO, String(indice))
}

function renomearSlot(indice: number) {
  const atual = lerSlot(indice) ?? criarSlotVazio(indice)
  const nome = window.prompt('Nome do slot', atual.nome)
  if (nome === null) return
  escreverSlot(indice, { ...atual, nome: nome.trim() || String(indice) })
}

function apagarSlot(indice: number) {
  const vazio = criarSlotVazio(indice)
  escreverSlot(indice, vazio)
  if (indice === slotAtivo) substituirLayout(vazio.payload)
}

useEffect(() => {
  if (slotsInicializadosRef.current) return
  slotsInicializadosRef.current = true

  const existeAlgumSlot = Array.from({ length: TOTAL_SLOTS }).some((_, idx) => !!localStorage.getItem(KEY_SLOT_PREFIX + (idx + 1)))
  for (let i = 1; i <= TOTAL_SLOTS; i++) {
    if (localStorage.getItem(KEY_SLOT_PREFIX + i)) continue
    const slot =
      !existeAlgumSlot && i === 1
        ? { ...criarSlotVazio(i), salvoEm: new Date().toISOString(), payload: snapshotAtual() }
        : criarSlotVazio(i)
    localStorage.setItem(KEY_SLOT_PREFIX + i, JSON.stringify(slot))
  }

  carregarDoSlot(slotAtivo)
}, [])
// === SLOTS | fim ===

  const [guias, setGuias] = useState<{ xPct?: number; yPct?: number } | null>(null)
  const [hoverPaiId, setHoverPaiId] = useState<string | null>(null)
  const [selecaoArrasto, setSelecaoArrasto] = useState<SelecaoArrasto | null>(null)

  const [confirmarFilhoAberto, setConfirmarFilhoAberto] = useState(false)
  const [pendenteFilho, setPendenteFilho] = useState<null | {
    id: string
    alvoPaiId: string
    novoXPct: number
    novoYPct: number
  }>(null)
  // === ESTADO UI | fim ===

  const refArea = useRef<HTMLDivElement | null>(null)
  const refCanvasRoot = useRef<HTMLDivElement | null>(null)
  const selecaoArrastoRef = useRef<SelecaoArrasto | null>(null)

  const raiz = useMemo(() => elementos.filter((e) => e.paiId === null), [elementos])
  const mapa = useMemo(() => new Map(elementos.map((e) => [e.id, e])), [elementos])

  const aspecto = resolucao.larguraPx / resolucao.alturaPx
  const [fit, setFit] = useState<{ width: number; height: number }>({ width: 800, height: 450 })

  // === FIT OBSERVER | inicio ===
  useEffect(() => {
    const area = refArea.current
    if (!area) return

    const ro = new ResizeObserver(() => {
      const r = area.getBoundingClientRect()
      setFit(calcularFit(r.width, r.height, aspecto))
    })

    ro.observe(area)
    const r0 = area.getBoundingClientRect()
    setFit(calcularFit(r0.width, r0.height, aspecto))

  

  return () => ro.disconnect()
  }, [aspecto])
  // === FIT OBSERVER | fim ===

  // === LAYOUT (IMPORT/EXPORT) | inicio ===
  function exportarLayout() {
    const payload = criarSnapshotBuilder({
      stack,
      presetResolucao,
      resolucao,
      magnetismoAtivo,
      aninharAtivo,
      elementos,
      elementoSelecionadoId,
    })
    const arquivo = criarArquivoLayout(payload)
    const blob = new Blob([JSON.stringify(arquivo, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `layout_page_architect_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  async function importarLayoutArquivo(file: File) {
    const txt = await file.text()
    let data: unknown
    try {
      data = JSON.parse(txt)
    } catch {
      alert('Arquivo inválido: JSON malformado.')
      return
    }
    const payload = extrairSnapshotBuilder(data)
    if (!payload) {
      alert('Arquivo inválido: não encontrei payload.elementos.')
      return
    }
  
    if (layoutModo === 'substituir') {
      substituirLayout(payload)
      escreverSlot(slotAtivo, {
        versao: 'slot_v2',
        nome: lerSlot(slotAtivo)?.nome ?? String(slotAtivo),
        salvoEm: new Date().toISOString(),
        payload,
      })
      return
    }

    const mesclado = mesclarSnapshotBuilder(snapshotAtual(), payload)
    mesclarLayoutImportado(payload)
    escreverSlot(slotAtivo, {
      versao: 'slot_v2',
      nome: lerSlot(slotAtivo)?.nome ?? String(slotAtivo),
      salvoEm: new Date().toISOString(),
      payload: mesclado,
    })
  }
  // === LAYOUT (IMPORT/EXPORT) | fim ===


  // === INFORMA TAMANHO PARA INSPECTOR | inicio ===
  useEffect(() => {
    props.onObterTamanhoPx(fit.width, fit.height)
  }, [fit.width, fit.height, props])
  // === INFORMA TAMANHO PARA INSPECTOR | fim ===

  // === Z-INDEX | inicio ===
  const trazerParaFrente = useCallback(
    (id: string) => {
      const maxZ = elementos.reduce((m, e) => Math.max(m, e.zIndex), 1)
      atualizarElemento(id, { zIndex: maxZ + 1 })
    },
    [elementos, atualizarElemento],
  )
    const enviarParaTras = useCallback(
    (id: string) => {
      const minZ = elementos.reduce((m, e) => Math.min(m, e.zIndex), 9999)
      atualizarElemento(id, { zIndex: minZ - 1 })
    },
    [elementos, atualizarElemento],
  )
  // === Z-INDEX | fim ===

  // === MENU CONTEXTO (FECHAR) | inicio ===
  useEffect(() => {
    function onDown(e: MouseEvent) {
      // só fecha quando clicar fora do menu (qualquer clique)
      if (!menuContexto) return
      setMenuContexto(null)
    }
    function onKey(e: KeyboardEvent) {
      if (!menuContexto) return
      if (e.key === 'Escape') setMenuContexto(null)
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuContexto])
  // === MENU CONTEXTO (FECHAR) | fim ===

  useEffect(() => {
    function fechar() {
      if (menuSlot) setMenuSlot(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') fechar()
    }
    window.addEventListener('mousedown', fechar)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', fechar)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuSlot])

  // === TECLAS (SETAS + DEL) | inicio ===
  useEffect(() => {
    function emInputAtivo() {
      const el = document.activeElement
      if (!el) return false
      const tag = (el as HTMLElement).tagName.toLowerCase()
      return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!elementoSelecionadoId) return
      if (emInputAtivo()) return

      const root = refCanvasRoot.current
      if (!root) return
      const r = root.getBoundingClientRect()
      const stepPx = e.shiftKey ? 10 : 1
      const dxPct = (stepPx / r.width) * 100
      const dyPct = (stepPx / r.height) * 100

      const elSel = mapa.get(elementoSelecionadoId)
      if (!elSel) return

      const ctrl = e.ctrlKey || (e as any).metaKey
      if (ctrl && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        duplicarElemento(elementoSelecionadoId)
        return
      }

      const ehSeta = e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown'
      if (ehSeta && elSel.moverTravado) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        atualizarElemento(elementoSelecionadoId, { xPct: clamp(elSel.xPct - dxPct, 0, 100 - elSel.wPct) })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        atualizarElemento(elementoSelecionadoId, { xPct: clamp(elSel.xPct + dxPct, 0, 100 - elSel.wPct) })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        atualizarElemento(elementoSelecionadoId, { yPct: clamp(elSel.yPct - dyPct, 0, 100 - elSel.hPct) })
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        atualizarElemento(elementoSelecionadoId, { yPct: clamp(elSel.yPct + dyPct, 0, 100 - elSel.hPct) })
      } else if (e.key === 'Delete') {
        e.preventDefault()
        removerElemento(elementoSelecionadoId)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [elementoSelecionadoId, mapa, atualizarElemento, removerElemento])
  // === TECLAS (SETAS + DEL) | fim ===

  // === DND (HTML5) PARA CRIAR | inicio ===
  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function onDropCanvas(e: React.DragEvent) {
    // evita duplicar quando o drop foi em um container interno
    if (e.target !== e.currentTarget) return

    e.preventDefault()
    const tipo = e.dataTransfer.getData('text/plain') as TipoElemento
    if (!tipo) return

    const alvo = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const xPct = ((e.clientX - alvo.left) / alvo.width) * 100
    const yPct = ((e.clientY - alvo.top) / alvo.height) * 100

    adicionarElemento(tipo, null, clamp(xPct, 0, 90), clamp(yPct, 0, 90))
  }

  function onDropEmContainer(e: React.DragEvent, paiId: string) {
    e.preventDefault()
    e.stopPropagation()

    const tipo = e.dataTransfer.getData('text/plain') as TipoElemento
    if (!tipo) return

    const alvo = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const xPct = ((e.clientX - alvo.left) / alvo.width) * 100
    const yPct = ((e.clientY - alvo.top) / alvo.height) * 100

    adicionarElemento(tipo, paiId, clamp(xPct, 0, 90), clamp(yPct, 0, 90))
  }
  // === DND (HTML5) PARA CRIAR | fim ===

  // === SELECAO POR ARRASTO | inicio ===
  function definirSelecaoArrasto(valor: SelecaoArrasto | null) {
    selecaoArrastoRef.current = valor
    setSelecaoArrasto(valor)
  }

  function pontoNoCanvas(e: React.PointerEvent | PointerEvent) {
    const root = refCanvasRoot.current
    if (!root) return { x: 0, y: 0 }
    const rect = root.getBoundingClientRect()
    return {
      x: clamp(e.clientX - rect.left, 0, rect.width),
      y: clamp(e.clientY - rect.top, 0, rect.height),
    }
  }

  function iniciarSelecaoPorArrasto(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    if (e.target !== refCanvasRoot.current) return
    const ponto = pontoNoCanvas(e)
    const inicio = { startX: ponto.x, startY: ponto.y, x: ponto.x, y: ponto.y }
    e.preventDefault()
    selecionarElemento(null)
    definirSelecaoArrasto(inicio)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function moverSelecaoPorArrasto(e: React.PointerEvent<HTMLDivElement>) {
    const atual = selecaoArrastoRef.current
    if (!atual) return
    e.preventDefault()
    const ponto = pontoNoCanvas(e)
    definirSelecaoArrasto({ ...atual, x: ponto.x, y: ponto.y })
  }

  function finalizarSelecaoPorArrasto(e: React.PointerEvent<HTMLDivElement>) {
    const atual = selecaoArrastoRef.current
    if (!atual) return
    e.preventDefault()
    definirSelecaoArrasto(null)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)

    const root = refCanvasRoot.current
    if (!root) return
    const base = root.getBoundingClientRect()
    const left = Math.min(atual.startX, atual.x)
    const top = Math.min(atual.startY, atual.y)
    const right = Math.max(atual.startX, atual.x)
    const bottom = Math.max(atual.startY, atual.y)
    if (right - left < 4 && bottom - top < 4) {
      selecionarElemento(null)
      return
    }

    const ids = elementos
      .filter((elemento) => {
        const rect = rectDoElemento(elemento.id)
        if (!rect) return false
        const elLeft = rect.left - base.left
        const elTop = rect.top - base.top
        const elRight = rect.right - base.left
        const elBottom = rect.bottom - base.top
        return elRight >= left && elLeft <= right && elBottom >= top && elTop <= bottom
      })
      .map((elemento) => elemento.id)

    selecionarElementos(ids)
  }

  const estiloSelecaoArrasto: CSSProperties | null = selecaoArrasto
    ? {
        left: Math.min(selecaoArrasto.startX, selecaoArrasto.x),
        top: Math.min(selecaoArrasto.startY, selecaoArrasto.y),
        width: Math.abs(selecaoArrasto.x - selecaoArrasto.startX),
        height: Math.abs(selecaoArrasto.y - selecaoArrasto.startY),
      }
    : null
  // === SELECAO POR ARRASTO | fim ===

  // === PROMPT MESTRE | inicio ===
  function gerarPromptMestre(modo: 'completo' | 'sem_estilos' | 'posicao', incluirInstrucoesLocal = true) {
    const linhas: string[] = []
    linhas.push(`[CONTEXTO TECNOLÓGICO: Desenvolver usando: ${stack}]`)
    linhas.push(`[RESOLUÇÃO: ${presetResolucao} | ${resolucao.larguraPx}x${resolucao.alturaPx}]`)
    linhas.push(`[GRADE VISUAL: ${resolucao.colunas} colunas x ${resolucao.linhas} linhas]`)

    const raizPrincipal = stack.startsWith('HTML') ? 'body' : stack.includes('React') || stack.includes('Next') ? 'div#root' : 'body'
    linhas.push(`[PAI RAIZ PRINCIPAL: ${raizPrincipal}]`)

    linhas.push('')
    linhas.push('INSTRUÇÃO MESTRE:')
    linhas.push('1) Respeite a hierarquia (filhos dentro do container).')
    linhas.push('2) Use as posições (% e col/row) como referência para layout responsivo.')

    if (modo === 'completo') {
      linhas.push('3) Respeite cores: token Tailwind + HEX para borda/texto/fundo.')
    } else {
      linhas.push('3) Ignore estilos, foque em estrutura e layout.')
    }

    linhas.push('4) Quando existir className/class, aplique exatamente no código final.')
    linhas.push('')

    // === RAIZ | inicio ===
    const raiz = stack.startsWith('HTML') ? 'body' : stack.includes('Next') ? 'body' : 'div#root'
    // === RAIZ | fim ===

    function colRow(e: ElementoBuilder) {
      const cs = Math.round((e.xPct / 100) * resolucao.colunas)
      const rs = Math.round((e.yPct / 100) * resolucao.linhas)
      const ce = cs + Math.round((e.wPct / 100) * resolucao.colunas)
      const re = rs + Math.round((e.hPct / 100) * resolucao.linhas)
      return { cs, rs, ce, re }
    }

    function tipoParaPrompt(tipo: string) {
      if (tipo.startsWith('tag_')) return tipo.replace('tag_', '')
      if (tipo === 'navbar') return 'nav'
      if (tipo === 'footer') return 'footer'
      if (tipo === 'hero') return 'section'
      if (tipo === 'sidebar') return 'aside'
      return tipo
    }

    function formatCor(c: ElementoBuilder['corBorda']) {
      return c.tokenTailwind ? `${c.tokenTailwind} | ${c.hex}` : c.hex
    }

    function imprimir(paiId: string | null, nivel: number) {
      const indent = '  '.repeat(nivel)
      const filhos = elementos
        .filter((x) => x.paiId === paiId)
        .sort((a, b) => a.yPct - b.yPct || a.xPct - b.xPct)

      filhos.forEach((e) => {
        const usaReact = stack.includes('React') || stack.includes('Next')
        const attrClasse = e.nomeCustom ? (usaReact ? ` className="${e.nomeCustom}"` : ` class="${e.nomeCustom}"`) : ''
        const nome = `${tipoParaPrompt(e.tipo)}${attrClasse}`
        const cr = colRow(e)
        const instr = incluirInstrucoesLocal && e.instrucoes?.trim() ? ` | Instruções: "${e.instrucoes.trim()}"` : ''
if (modo === 'completo') {
  linhas.push(
    `${indent}📦 ${nome}${instr} -> x:${e.xPct.toFixed(2)}% y:${e.yPct.toFixed(2)}% w:${e.wPct.toFixed(2)}% h:${e.hPct.toFixed(
      2,
    )}% | [Col ${cr.cs}-${cr.ce}] [Row ${cr.rs}-${cr.re}] | Borda: ${formatCor(e.corBorda)} | Texto: ${formatCor(
      e.corTexto,
    )} | Fundo: ${formatCor(e.corFundo)}`,
  )
} else if (modo === 'sem_estilos') {
  linhas.push(
    `${indent}📦 ${nome}${instr} -> x:${e.xPct.toFixed(2)}% y:${e.yPct.toFixed(2)}% w:${e.wPct.toFixed(2)}% h:${e.hPct.toFixed(
      2,
    )}% | [Col ${cr.cs}-${cr.ce}] [Row ${cr.rs}-${cr.re}]`,
  )
} else {
  linhas.push(
    `${indent}📦 ${nome}${instr} -> x:${e.xPct.toFixed(2)}% y:${e.yPct.toFixed(2)}% w:${e.wPct.toFixed(2)}% h:${e.hPct.toFixed(2)}%`,
  )
}

        imprimir(e.id, nivel + 1)
      })
    }

    // Linha da raiz principal (ex: body / div#root)
    if (modo === 'posicao') {
      linhas.push(`📦 ${raiz} -> x:0.00% y:0.00% w:100.00% h:100.00%`)
    } else {
      linhas.push(`📦 ${raiz} -> x:0.00% y:0.00% w:100.00% h:100.00% | [Col 0-${resolucao.colunas}] [Row 0-${resolucao.linhas}]`)
    }
    imprimir(null, 1)
    linhas.push('')
    linhas.push('OBS: Converta a hierarquia e posições para flex/grid semântico, evitando position:absolute no produto final.')
    return linhas.join('\n')
  }

  function copiarToast(texto: string) {
    window.setTimeout(() => {
      console.info(texto)
    }, 0)
  }

  async function copiarTexto(texto: string) {
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
  // === PROMPT MESTRE | fim ===

  // === SOLICITAÇÃO DE ANINHAMENTO (COM MODAL) | inicio ===
  const solicitarConfirmacaoFilho = useCallback(
    (payload: { id: string; alvoPaiId: string; novoXPct: number; novoYPct: number }) => {
      setPendenteFilho(payload)
      setConfirmarFilhoAberto(true)
    },
    [],
  )
  // === SOLICITAÇÃO DE ANINHAMENTO (COM MODAL) | fim ===

  // === MENU CONTEXTO (AÇÕES) | inicio ===
  // === MENU CONTEXTO (AÇÕES) | inicio ===
function colarNaPosicao(xPct: number, yPct: number) {
  if (!clipboard) return
  const colagem = clonarClipboardNaPosicao(
    clipboard,
    xPct,
    yPct,
    elementos.map((elemento) => elemento.id),
  )
  adicionarElementosEmLote(colagem.elementos, colagem.elementoSelecionadoId)
}

function executarAcaoMenu(
  acao:
    | 'deletar'
    | 'fit_w'
    | 'fit_h'
    | 'frente'
    | 'tras'
    | 'copiar'
    | 'recortar'
    | 'colar'
    | 'duplicar',
) {
  if (!menuContexto) return

  // colar pode acontecer no background
  if (acao === 'colar') {
    colarNaPosicao(menuContexto.xPct, menuContexto.yPct)
    setMenuContexto(null)
    return
  }

  const id = menuContexto.id
  if (!id) {
    setMenuContexto(null)
    return
  }

  const el = mapa.get(id)
  if (!el) {
    setMenuContexto(null)
    return
  }

  if (acao === 'copiar') {
    setClipboard({ raiz: el, filhos: coletarSubarvoreBuilder(elementos, el.id) })
  } else if (acao === 'recortar') {
    setClipboard({ raiz: el, filhos: coletarSubarvoreBuilder(elementos, el.id) })
    removerElemento(id)
  } else if (acao === 'deletar') {
    removerElemento(id)
  } else if (acao === 'duplicar') {
    duplicarElemento(id)
  } else if (acao === 'fit_w') {
    atualizarElemento(id, { xPct: 0, wPct: 100 })
  } else if (acao === 'fit_h') {
    atualizarElemento(id, { yPct: 0, hPct: 100 })
  } else if (acao === 'frente') {
    trazerParaFrente(id)
  } else if (acao === 'tras') {
    enviarParaTras(id)
  }

  setMenuContexto(null)
}
// === MENU CONTEXTO (AÇÕES) | fim ===

  const slots = useMemo(
    () => Array.from({ length: TOTAL_SLOTS }, (_, idx) => lerSlot(idx + 1) ?? criarSlotVazio(idx + 1)),
    [versaoSlots],
  )

  return (
    <div className="h-full w-full overflow-hidden p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
      {/* === BARRA TOPO | inicio === */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => salvarNoSlot(slotAtivo)}
            className={
              'w-10 h-10 rounded-xl border flex items-center justify-center ' +
              'bg-indigo-500/10 border-indigo-500/40 text-indigo-200 hover:border-indigo-400'
            }
            title={`Salvar slot ativo (${slotAtivo})`}
          >
            <Save className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {slots.map((slot, idx) => {
              const i = idx + 1
              const ativo = i === slotAtivo
              const vazio = !slot.salvoEm && slot.payload.elementos.length === 0

              return (
                <button
                  key={i}
                  onClick={() => carregarDoSlot(i)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setMenuSlot({ indice: i, x: e.clientX, y: e.clientY })
                  }}
                  className={
                    'min-w-10 max-w-24 h-10 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center truncate ' +
                    (ativo
                      ? 'bg-indigo-600 border-indigo-400 text-white'
                      : vazio
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-indigo-500')
                  }
                  title={`Slot ${i}: ${slot.nome}`}
                >
                  {slot.nome || i}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayoutAberto(true)}
            className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-950 hover:border-indigo-500 flex items-center justify-center"
            title="Importar / exportar layout"
          >
            <Upload className="w-4 h-4 text-slate-200" />
          </button>

          <button
            onClick={exportarLayout}
            className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-950 hover:border-indigo-500 flex items-center justify-center"
            title="Exportar layout"
          >
            <Download className="w-4 h-4 text-slate-200" />
          </button>

          <button
            onClick={() => {
              const confirmou = confirm('Limpar tudo?')
              if (confirmou) limparTudo()
            }}
            className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-950 hover:border-red-500 flex items-center justify-center"
            title="Limpar canvas"
          >
            <Trash2 className="w-4 h-4 text-red-300" />
          </button>

          <button
            onClick={() => {
              const promptGerado = gerarPromptMestre(modoPrompt, incluirInstrucoes)
              setPrompt(promptGerado)
              setPromptAberto(true)
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2"
            title="Abrir PROMPT"
          >
            <Bot className="w-4 h-4" />
            PROMPT
          </button>
        </div>
      </div>
      {/* === BARRA TOPO | fim === */}

      {menuSlot ? (
        <div
          className="fixed z-[240] w-44 rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-2xl"
          style={{ left: menuSlot.x, top: menuSlot.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              renomearSlot(menuSlot.indice)
              setMenuSlot(null)
            }}
            className="w-full px-3 py-2 rounded-lg text-left text-xs font-bold text-slate-100 hover:bg-slate-800"
          >
            Renomear
          </button>
          <button
            onClick={() => {
              setConfirmLimparSlot(menuSlot.indice)
              setMenuSlot(null)
            }}
            className="w-full px-3 py-2 rounded-lg text-left text-xs font-bold text-red-200 hover:bg-red-500/10"
          >
            Apagar
          </button>
        </div>
      ) : null}

      {/* === MODAL LIMPAR SLOT | inicio === */}
      {confirmLimparSlot ? (
        <div className="fixed inset-0 z-[999] bg-slate-950/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-slate-800 p-4">
            <div className="text-slate-100 font-extrabold mb-2">Apagar espaço de salvamento?</div>
            <div className="text-sm text-slate-400">Isso remove os dados do slot {confirmLimparSlot}.</div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmLimparSlot(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-600 text-slate-200 text-sm font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  apagarSlot(confirmLimparSlot)
                  setConfirmLimparSlot(null)
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-extrabold"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {/* === MODAL LIMPAR SLOT | fim === */}

      {/* === ÁREA COM FIT | inicio === */}
      <div
        ref={refArea}
        className="flex-1 min-h-0 rounded-2xl border border-slate-800 bg-slate-950/40 p-3 overflow-auto"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div
            className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl"
            style={{ width: fit.width, height: fit.height }}
          >
            <div
              ref={refCanvasRoot}
              data-canvas-root="1"
              className="absolute inset-0"
              onPointerDownCapture={(e) => {
                if (!e.altKey) return
                const lista = (document.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[])
                  .map((node) => node.dataset?.elementoId)
                  .filter(Boolean) as string[]
                const unicos = Array.from(new Set(lista))
                if (unicos.length === 0) return
                e.preventDefault()
                e.stopPropagation()
                const atual = elementoSelecionadoId
                const idx = atual ? unicos.indexOf(atual) : -1
                const prox = unicos[(idx + 1) % unicos.length]
                selecionarElemento(prox)
              }}
              onDragOver={onDragOver}
              onDrop={onDropCanvas}
              style={{
                backgroundImage: resolucao.mostrarGrade
                  ? 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)'
                  : 'none',
                backgroundSize: resolucao.mostrarGrade
                  ? `calc(100% / ${resolucao.colunas}) calc(100% / ${resolucao.linhas})`
                  : 'auto',
                backgroundColor: '#ffffff',
              }}
              onPointerDown={(e) => {
                iniciarSelecaoPorArrasto(e)
              }}
              onPointerMove={moverSelecaoPorArrasto}
              onPointerUp={finalizarSelecaoPorArrasto}
              onPointerCancel={finalizarSelecaoPorArrasto}
              onContextMenu={(e) => {
                e.preventDefault()
                const root = refCanvasRoot.current
                if (!root) return
                const rect = root.getBoundingClientRect()
                const xPct = ((e.clientX - rect.left) / rect.width) * 100
                const yPct = ((e.clientY - rect.top) / rect.height) * 100
                setMenuContexto({ id: null, x: e.clientX, y: e.clientY, xPct, yPct })
              }}
            >
              {/* === GUIAS OVERLAY | inicio === */}
              {guias?.xPct !== undefined ? (
                <div className="absolute inset-y-0 w-px bg-emerald-500/70 z-[60]" style={{ left: `${guias.xPct}%` }} />
              ) : null}
              {guias?.yPct !== undefined ? (
                <div className="absolute inset-x-0 h-px bg-emerald-500/70 z-[60]" style={{ top: `${guias.yPct}%` }} />
              ) : null}
              {hoverPaiId ? (
                <div
                  className="absolute z-[55] pointer-events-none border-2 border-amber-500/70 rounded-xl"
                  style={(() => {
                    const rectElemento = rectDoElemento(hoverPaiId)
                    const rectBase = refCanvasRoot.current?.getBoundingClientRect()
                    if (!rectElemento || !rectBase) return { display: 'none' } as React.CSSProperties
                    const left = ((rectElemento.left - rectBase.left) / rectBase.width) * 100
                    const top = ((rectElemento.top - rectBase.top) / rectBase.height) * 100
                    const width = (rectElemento.width / rectBase.width) * 100
                    const height = (rectElemento.height / rectBase.height) * 100
                    return {
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                    }
                  })()}
                />
              ) : null}
              {/* === GUIAS OVERLAY | fim === */}

              {estiloSelecaoArrasto ? (
                <div
                  className="absolute z-[90] pointer-events-none border border-indigo-500 bg-indigo-500/10"
                  style={estiloSelecaoArrasto}
                />
              ) : null}

              {raiz.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 select-none pointer-events-none">
                  <MousePointerClick className="w-10 h-10 mb-2" />
                  <div className="font-bold">Canvas</div>
                  <div className="text-xs">Arraste peças para adicionar</div>
                </div>
              ) : null}

              {raiz.map((elementoRaiz) => (
                <ElementoNoCanvas
                  key={elementoRaiz.id}
                  elemento={elementoRaiz}
                  mapa={mapa}
                  elementoSelecionadoId={elementoSelecionadoId}
                  elementoSelecionadoIds={elementoSelecionadoIds}
                  magnetismoAtivo={magnetismoAtivo}
                  aninharAtivo={aninharAtivo}
                  bordaLocalizacaoAtiva={bordaLocalizacaoAtiva}
                  selecionado={elementoSelecionadoIds.includes(elementoRaiz.id)}
                  onSelecionar={(id, multi) => (multi && id ? alternarSelecaoElemento(id) : selecionarElemento(id))}
                  onAtualizar={atualizarElemento}
                  onRemover={removerElemento}
                  onDuplicar={duplicarElemento}
                  onTrazerParaFrente={trazerParaFrente}
                  onSolicitarConfirmacaoFilho={solicitarConfirmacaoFilho}
                  onSetHoverPaiId={setHoverPaiId}
                  onSetGuias={setGuias}
                  onAbrirMenuContexto={(id, x, y) => {
                    const root = refCanvasRoot.current
                    if (!root) return
                    const rect = root.getBoundingClientRect()
                    const xPct = ((x - rect.left) / rect.width) * 100
                    const yPct = ((y - rect.top) / rect.height) * 100
                    setMenuContexto({ id, x, y, xPct, yPct })
                  }}
                  onDropNovo={(evento, paiId) => onDropEmContainer(evento, paiId)}
                  onIniciarTransacaoHistorico={iniciarTransacaoHistorico}
                  onFinalizarTransacaoHistorico={finalizarTransacaoHistorico}
                />
              ))}
            </div>

            {/* === MENU CONTEXTO | inicio === */}
            {menuContexto ? (
              <div
                className="fixed z-[220] bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-xs font-extrabold"
                style={{ left: menuContexto.x, top: menuContexto.y }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button className="w-full text-left px-3 py-2 hover:bg-slate-900 text-slate-100" onClick={() => executarAcaoMenu('copiar')}>
                  Copiar
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-slate-900 text-slate-100" onClick={() => executarAcaoMenu('recortar')}>
                  Recortar
                </button>
                <button
                  className={`w-full text-left px-3 py-2 hover:bg-slate-900 ${clipboard ? 'text-slate-100' : 'text-slate-600 cursor-not-allowed'}`}
                  onClick={() => {
                    if (clipboard) executarAcaoMenu('colar')
                  }}
                >
                  Colar
                </button>

                <div className="h-px bg-slate-800" />

                <button className="w-full text-left px-3 py-2 hover:bg-slate-900 text-slate-100" onClick={() => executarAcaoMenu('duplicar')}>
                  Duplicar
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-slate-900 text-red-300" onClick={() => executarAcaoMenu('deletar')}>
                  Deletar
                </button>

                <div className="h-px bg-slate-800" />

                <button className="w-full text-left px-3 py-2 hover:bg-slate-900 text-slate-100" onClick={() => executarAcaoMenu('fit_w')}>
                  Fit to W
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-slate-900 text-slate-100" onClick={() => executarAcaoMenu('fit_h')}>
                  Fit to H
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-slate-900 text-slate-100" onClick={() => executarAcaoMenu('frente')}>
                  Trazer para frente
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-slate-900 text-slate-100" onClick={() => executarAcaoMenu('tras')}>
                  Enviar para trás
                </button>
              </div>
            ) : null}
            {/* === MENU CONTEXTO | fim === */}
          </div>
        </div>
      </div>
      {/* === ÁREA COM FIT | fim === */}

      {/* === LAYOUT MODAL | inicio === */}
      {layoutAberto ? (
        <div
          className="fixed inset-0 z-[230] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={() => setLayoutAberto(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <div className="text-xs font-extrabold text-indigo-200">Importar / Exportar Layout</div>
              <button
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-100 text-xs font-extrabold"
                onClick={() => setLayoutAberto(false)}
              >
                Fechar
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLayoutModo('substituir')}
                  className={`px-3 py-2 rounded-xl border text-xs font-extrabold ${
                    layoutModo === 'substituir'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-100 border-slate-800 hover:border-indigo-500'
                  }`}
                >
                  Substituir
                </button>
                <button
                  onClick={() => setLayoutModo('mesclar')}
                  className={`px-3 py-2 rounded-xl border text-xs font-extrabold ${
                    layoutModo === 'mesclar'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-100 border-slate-800 hover:border-indigo-500'
                  }`}
                >
                  Mesclar
                </button>
                <div className="ml-auto text-[10px] text-slate-400">Mesclar aplica offset + remapeio de IDs</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={exportarLayout}
                  className="px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 hover:border-emerald-400 text-emerald-200 text-xs font-extrabold"
                >
                  Exportar JSON
                </button>

                <label className="px-4 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/25 hover:border-amber-400 text-amber-200 text-xs font-extrabold cursor-pointer text-center">
                  Importar JSON
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0]
                      if (arquivo) void importarLayoutArquivo(arquivo)
                      e.currentTarget.value = ''
                      setLayoutAberto(false)
                    }}
                  />
                </label>
              </div>

              <div className="text-[10px] text-slate-500">
                Exporta e importa: layout, blocos, cores, hierarquia e configurações do builder.
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {/* === LAYOUT MODAL | fim === */}

      {/* === MODAL FILHO | inicio === */}
      <ModalConfirmarFilho
        aberto={confirmarFilhoAberto && !!pendenteFilho}
        titulo="Adicionar este componente como filho do container?"
        descricao="Se você escolher SIM, o componente vira filho e passa a mover junto com o pai. Se escolher NÃO, ele permanece flutuante na frente."
        onSim={() => {
          if (!pendenteFilho) return
          atualizarElemento(pendenteFilho.id, {
            paiId: pendenteFilho.alvoPaiId,
            xPct: pendenteFilho.novoXPct,
            yPct: pendenteFilho.novoYPct,
          })
          setConfirmarFilhoAberto(false)
          setPendenteFilho(null)
        }}
        onNao={() => {
          if (pendenteFilho) trazerParaFrente(pendenteFilho.id)
          setConfirmarFilhoAberto(false)
          setPendenteFilho(null)
        }}
      />
      {/* === MODAL FILHO | fim === */}

      <ModalPromptMestre
        aberto={promptAberto}
        prompt={prompt}
        modo={modoPrompt}
        incluirInstrucoes={incluirInstrucoes}
        onMudarModo={(modo) => {
          setModoPrompt(modo)
          setPrompt(gerarPromptMestre(modo, incluirInstrucoes))
        }}
        onToggleInstrucoes={() => {
          setIncluirInstrucoes((valorAtual) => {
            const novoValor = !valorAtual
            setPrompt(gerarPromptMestre(modoPrompt, novoValor))
            return novoValor
          })
        }}
        onFechar={() => setPromptAberto(false)}
        onCopiar={() => copiarTexto(prompt)}
      />
    </div>
  )
}

function detectarLadoDuploClique(evento: React.MouseEvent<HTMLDivElement>, elemento: HTMLDivElement | null) {
  if (!elemento) return null
  const rect = elemento.getBoundingClientRect()
  const margem = 18
  const distancias = {
    n: Math.abs(evento.clientY - rect.top),
    s: Math.abs(rect.bottom - evento.clientY),
    e: Math.abs(rect.right - evento.clientX),
    w: Math.abs(evento.clientX - rect.left),
  } as const

  const lado = Object.entries(distancias).sort((a, b) => a[1] - b[1])[0]
  if (!lado) return null
  if (lado[1] > margem) return null
  return lado[0] as 'n' | 's' | 'e' | 'w'
}

function aplicarFitLado(
  lado: 'n' | 's' | 'e' | 'w',
  elemento: ElementoBuilder,
  mapa: Map<string, ElementoBuilder>,
  onAplicar: (parcial: Partial<ElementoBuilder>) => void,
) {
  const limiteMinimo = 2
  const irmaos = Array.from(mapa.values()).filter((item) => item.id !== elemento.id && item.paiId === elemento.paiId)

  if (lado === 'w') {
    const esquerdaMaisProxima = irmaos
      .map((item) => item.xPct + item.wPct)
      .filter((valor) => valor <= elemento.xPct)
      .sort((a, b) => b - a)[0] ?? 0
    const novoXPct = esquerdaMaisProxima
    const novoWPct = Math.max(limiteMinimo, elemento.xPct + elemento.wPct - novoXPct)
    onAplicar({ xPct: novoXPct, wPct: novoWPct })
    return
  }

  if (lado === 'e') {
    const direitaMaisProxima = irmaos
      .map((item) => item.xPct)
      .filter((valor) => valor >= elemento.xPct + elemento.wPct)
      .sort((a, b) => a - b)[0] ?? 100
    const novoWPct = Math.max(limiteMinimo, direitaMaisProxima - elemento.xPct)
    onAplicar({ wPct: novoWPct })
    return
  }

  if (lado === 'n') {
    const topoMaisProximo = irmaos
      .map((item) => item.yPct + item.hPct)
      .filter((valor) => valor <= elemento.yPct)
      .sort((a, b) => b - a)[0] ?? 0
    const novoYPct = topoMaisProximo
    const novoHPct = Math.max(limiteMinimo, elemento.yPct + elemento.hPct - novoYPct)
    onAplicar({ yPct: novoYPct, hPct: novoHPct })
    return
  }

  const baseMaisProxima = irmaos
    .map((item) => item.yPct)
    .filter((valor) => valor >= elemento.yPct + elemento.hPct)
    .sort((a, b) => a - b)[0] ?? 100
  const novoHPct = Math.max(limiteMinimo, baseMaisProxima - elemento.yPct)
  onAplicar({ hPct: novoHPct })
}

// === ELEMENTO NO CANVAS | inicio ===
function ElementoNoCanvas(props: {
  elemento: ElementoBuilder
  mapa: Map<string, ElementoBuilder>
  elementoSelecionadoId: string | null
  elementoSelecionadoIds: string[]
  selecionado: boolean
  magnetismoAtivo: boolean
  aninharAtivo: boolean
  bordaLocalizacaoAtiva: boolean
  onSelecionar: (id: string | null, multi?: boolean) => void
  onAtualizar: (id: string, parcial: Partial<ElementoBuilder>) => void
  onRemover: (id: string) => void
  onDuplicar: (id: string) => string | null
  onTrazerParaFrente: (id: string) => void
  onSolicitarConfirmacaoFilho: (payload: { id: string; alvoPaiId: string; novoXPct: number; novoYPct: number }) => void
  onAbrirMenuContexto: (id: string, x: number, y: number) => void
  onDropNovo: (e: React.DragEvent, paiId: string) => void
  onSetHoverPaiId: (id: string | null) => void
  onSetGuias: (g: { xPct?: number; yPct?: number } | null) => void
  onIniciarTransacaoHistorico: () => void
  onFinalizarTransacaoHistorico: () => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  // === INTERAÇÃO (REESCRITA) | inicio ===
  type Modo = 'mover' | 'resize'
  type Alca = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

  const interacaoRef = useRef<null | {
    modo: Modo
    idAlvo: string
    alca?: Alca
    startX: number
    startY: number
    paiRect: Retangulo
    startXPct: number
    startYPct: number
    startWPct: number
    startHPct: number
  }>(null)

  function iniciarListeners() {
    window.addEventListener('pointermove', onMoveWindow, { passive: false })
    window.addEventListener('pointerup', onUpWindow, { passive: false })
    window.addEventListener('pointercancel', onUpWindow, { passive: false })
  }

  function removerListeners() {
    window.removeEventListener('pointermove', onMoveWindow as any)
    window.removeEventListener('pointerup', onUpWindow as any)
    window.removeEventListener('pointercancel', onUpWindow as any)
  }

  function iniciarMover(e: React.PointerEvent) {
    // botão direito abre menu
    if (e.button === 2) return
    if ((e.target as HTMLElement).closest('[data-handle="1"]')) return

    e.preventDefault()
    e.stopPropagation()
    const duplicando = (e.ctrlKey || e.metaKey) && !e.shiftKey
    const idAlvo = duplicando ? props.onDuplicar(props.elemento.id) : props.elemento.id
    if (!idAlvo) return
    props.onSelecionar(idAlvo, !duplicando && e.shiftKey)

    if (props.elemento.moverTravado) return

    const elDom = ref.current
    const paiDom = elDom?.parentElement as HTMLElement | null
    if (!elDom || !paiDom) return

    const pr = paiDom.getBoundingClientRect()
    props.onIniciarTransacaoHistorico()

    interacaoRef.current = {
      modo: 'mover',
      idAlvo,
      startX: e.clientX,
      startY: e.clientY,
      paiRect: { left: pr.left, top: pr.top, right: pr.right, bottom: pr.bottom, width: pr.width, height: pr.height },
      startXPct: props.elemento.xPct,
      startYPct: props.elemento.yPct,
      startWPct: props.elemento.wPct,
      startHPct: props.elemento.hPct,
    }

    iniciarListeners()
  }

  function iniciarResize(e: React.PointerEvent, alca: Alca) {
    if (props.elemento.resizeTravado) return
    e.preventDefault()
    e.stopPropagation()
    props.onSelecionar(props.elemento.id, e.shiftKey || e.ctrlKey || e.metaKey)

    const elDom = ref.current
    const paiDom = elDom?.parentElement as HTMLElement | null
    if (!elDom || !paiDom) return

    const pr = paiDom.getBoundingClientRect()
    interacaoRef.current = {
      modo: 'resize',
      idAlvo: props.elemento.id,
      alca,
      startX: e.clientX,
      startY: e.clientY,
      paiRect: { left: pr.left, top: pr.top, right: pr.right, bottom: pr.bottom, width: pr.width, height: pr.height },
      startXPct: props.elemento.xPct,
      startYPct: props.elemento.yPct,
      startWPct: props.elemento.wPct,
      startHPct: props.elemento.hPct,
    }

    iniciarListeners()
  }

  function aplicarMagnetismoPosicao(x: number, y: number) {
    if (!props.magnetismoAtivo) return { x, y, gx: undefined as number | undefined, gy: undefined as number | undefined }

    const thresholdPx = 10
    const tX = (thresholdPx / interacaoRef.current!.paiRect.width) * 100
    const tY = (thresholdPx / interacaoRef.current!.paiRect.height) * 100

    const siblings = Array.from(props.mapa.values()).filter((s) => s.paiId === props.elemento.paiId && s.id !== props.elemento.id)

    const w = props.elemento.wPct
    const h = props.elemento.hPct

    const candX: number[] = [0, 100 - w]
    const candY: number[] = [0, 100 - h]

    siblings.forEach((s) => {
      // alinhar bordas (left/right)
      candX.push(s.xPct)
      candX.push(s.xPct + s.wPct - w)
      candX.push(s.xPct + s.wPct)
      candX.push(s.xPct - w)

      // alinhar centro X
      const centroAlvo = s.xPct + s.wPct / 2
      candX.push(centroAlvo - w / 2)
    })

    siblings.forEach((s) => {
      // alinhar bordas (top/bottom)
      candY.push(s.yPct)
      candY.push(s.yPct + s.hPct - h)
      candY.push(s.yPct + s.hPct)
      candY.push(s.yPct - h)

      // alinhar centro Y
      const centroAlvo = s.yPct + s.hPct / 2
      candY.push(centroAlvo - h / 2)
    })

    let melhorX = x
    let melhorDx = Infinity
    for (const cx of candX) {
      const dx = cx - x
      if (Math.abs(dx) <= tX && Math.abs(dx) < Math.abs(melhorDx)) {
        melhorDx = dx
        melhorX = cx
      }
    }

    let melhorY = y
    let melhorDy = Infinity
    for (const cy of candY) {
      const dy = cy - y
      if (Math.abs(dy) <= tY && Math.abs(dy) < Math.abs(melhorDy)) {
        melhorDy = dy
        melhorY = cy
      }
    }

    const gx = melhorDx !== Infinity ? melhorX : undefined
    const gy = melhorDy !== Infinity ? melhorY : undefined
    return { x: clamp(melhorX, 0, 100 - w), y: clamp(melhorY, 0, 100 - h), gx, gy }
  }

  function onMoveWindow(ev: PointerEvent) {
    if (!interacaoRef.current) return
    ev.preventDefault()

    const ctx = interacaoRef.current
    let dxPct = ((ev.clientX - ctx.startX) / ctx.paiRect.width) * 100
    let dyPct = ((ev.clientY - ctx.startY) / ctx.paiRect.height) * 100

    if (ctx.modo === 'mover') {
      if (ev.shiftKey) {
        const dxPx = Math.abs(ev.clientX - ctx.startX)
        const dyPx = Math.abs(ev.clientY - ctx.startY)
        if (dxPx >= dyPx) dyPct = 0
        else dxPct = 0
      }

      let nx = clamp(ctx.startXPct + dxPct, 0, 100 - ctx.startWPct)
      let ny = clamp(ctx.startYPct + dyPct, 0, 100 - ctx.startHPct)

      const snap = aplicarMagnetismoPosicao(nx, ny)
      nx = snap.x
      ny = snap.y
      props.onSetGuias(snap.gx || snap.gy ? { xPct: snap.gx, yPct: snap.gy } : null)

      props.onAtualizar(ctx.idAlvo, { xPct: nx, yPct: ny })

      if (props.aninharAtivo) {
        const cx = ctx.paiRect.left + ((nx + ctx.startWPct / 2) / 100) * ctx.paiRect.width
        const cy = ctx.paiRect.top + ((ny + ctx.startHPct / 2) / 100) * ctx.paiRect.height
        const alvo = encontrarContainerMaisProfundoPorPonto(cx, cy, ctx.idAlvo, props.mapa)
        props.onSetHoverPaiId(alvo)
      } else {
        props.onSetHoverPaiId(null)
      }
      return
    }

    // === RESIZE | inicio ===
    const minW = 1
    const minH = 1

    let x = ctx.startXPct
    let y = ctx.startYPct
    let w = ctx.startWPct
    let h = ctx.startHPct
    const a = ctx.alca!

    if (a.includes('e')) w = clamp(w + dxPct, minW, 100 - x)
    if (a.includes('s')) h = clamp(h + dyPct, minH, 100 - y)

    if (a.includes('w')) {
      const nx = clamp(x + dxPct, 0, x + w - minW)
      w = clamp(w + (x - nx), minW, 100)
      x = nx
    }

    if (a.includes('n')) {
      const ny = clamp(y + dyPct, 0, y + h - minH)
      h = clamp(h + (y - ny), minH, 100)
      y = ny
    }

    // proporção travada
    if (props.elemento.proporcaoTravada && ctx.startHPct > 0) {
      const proporcao = ctx.startWPct / ctx.startHPct
      if (a.includes('e') || a.includes('w')) {
        h = clamp(w / proporcao, minH, 100 - y)
      } else if (a.includes('s') || a.includes('n')) {
        w = clamp(h * proporcao, minW, 100 - x)
      }
    }

// === MAGNETISMO RESIZE (CANTOS) | inicio ===
if (props.magnetismoAtivo) {
  const thresholdPx = 10
  const tX = (thresholdPx / ctx.paiRect.width) * 100
  const tY = (thresholdPx / ctx.paiRect.height) * 100

  const siblings = Array.from(props.mapa.values()).filter((s) => s.paiId === props.elemento.paiId && s.id !== props.elemento.id)

  const candX: number[] = [0, 100]
  const candY: number[] = [0, 100]
  siblings.forEach((s) => {
    candX.push(s.xPct)
    candX.push(s.xPct + s.wPct)
    candY.push(s.yPct)
    candY.push(s.yPct + s.hPct)
  })

  let gx: number | undefined
  let gy: number | undefined

  const right = x + w
  const bottom = y + h

  // snap right (e)
  if (a.includes('e')) {
    let best = Infinity
    for (const cx of candX) {
      const dx = cx - right
      if (Math.abs(dx) <= tX && Math.abs(dx) < Math.abs(best)) best = dx
    }
    if (best !== Infinity) {
      w = clamp(w + best, minW, 100 - x)
      gx = x + w
    }
  }

  // snap left (w)
  if (a.includes('w')) {
    let best = Infinity
    for (const cx of candX) {
      const dx = cx - x
      if (Math.abs(dx) <= tX && Math.abs(dx) < Math.abs(best)) best = dx
    }
    if (best !== Infinity) {
      const novoX = clamp(x + best, 0, x + w - minW)
      w = clamp((x + w) - novoX, minW, 100)
      x = novoX
      gx = x
    }
  }

  // snap bottom (s)
  if (a.includes('s')) {
    let best = Infinity
    for (const cy of candY) {
      const dy = cy - bottom
      if (Math.abs(dy) <= tY && Math.abs(dy) < Math.abs(best)) best = dy
    }
    if (best !== Infinity) {
      h = clamp(h + best, minH, 100 - y)
      gy = y + h
    }
  }

  // snap top (n)
  if (a.includes('n')) {
    let best = Infinity
    for (const cy of candY) {
      const dy = cy - y
      if (Math.abs(dy) <= tY && Math.abs(dy) < Math.abs(best)) best = dy
    }
    if (best !== Infinity) {
      const novoY = clamp(y + best, 0, y + h - minH)
      h = clamp((y + h) - novoY, minH, 100)
      y = novoY
      gy = y
    }
  }

  props.onSetGuias(gx || gy ? { xPct: gx, yPct: gy } : null)
}
// === MAGNETISMO RESIZE (CANTOS) | fim ===

    props.onAtualizar(ctx.idAlvo, { xPct: x, yPct: y, wPct: w, hPct: h })
    // === RESIZE | fim ===
  }

  function onUpWindow() {
    if (!interacaoRef.current) return

    const ctx = interacaoRef.current
    interacaoRef.current = null
    removerListeners()
    props.onFinalizarTransacaoHistorico()

    // === ANINHAMENTO POR CENTRO (B) | inicio ===
    if (ctx.modo === 'mover' && props.aninharAtivo) {
      const elDom = (document.querySelector(`[data-elemento-id="${ctx.idAlvo}"]`) as HTMLElement | null) ?? ref.current
      if (!elDom) return

      const r = elDom.getBoundingClientRect()
      const { cx, cy } = obterCentro({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height })

      const alvo = encontrarContainerMaisProfundoPorPonto(cx, cy, ctx.idAlvo, props.mapa)
      if (!alvo) return
      if (alvo === props.elemento.paiId) return

      // converte para coordenadas do novo pai
      const rPai = rectDoElemento(alvo)
      if (!rPai) return
      const leftPx = r.left - rPai.left
      const topPx = r.top - rPai.top

      let novoXPct = (leftPx / rPai.width) * 100
      let novoYPct = (topPx / rPai.height) * 100

      novoXPct = clamp(novoXPct, 0, 100 - ctx.startWPct)
      novoYPct = clamp(novoYPct, 0, 100 - ctx.startHPct)

      props.onSolicitarConfirmacaoFilho({ id: ctx.idAlvo, alvoPaiId: alvo, novoXPct, novoYPct })
    }
    // === ANINHAMENTO POR CENTRO (B) | fim ===
  }
  // === INTERAÇÃO (REESCRITA) | fim ===

  // === HIERARQUIA | inicio ===
  const filhos = useMemo(() => {
    return Array.from(props.mapa.values())
      .filter((x) => x.paiId === props.elemento.id)
      .sort((a, b) => a.yPct - b.yPct || a.xPct - b.xPct)
  }, [props.mapa, props.elemento.id])
  // === HIERARQUIA | fim ===

  const zIndexElemento = typeof props.elemento.zIndex === 'number' ? props.elemento.zIndex : 0
  const possuiBordaVisivel = (props.elemento.borderWidthPx ?? 0) > 0 && props.elemento.corBorda.hex !== 'transparent'
  const possuiCorTextoCustom = props.elemento.corTexto.hex !== 'inherit'
  const possuiCorFundoCustom = props.elemento.corFundo.hex !== 'transparent'
  const sombraElemento = [
    props.bordaLocalizacaoAtiva ? 'inset 0 0 0 1px #000, 0 0 0 1px #000' : '',
    props.selecionado ? '0 0 0 2px rgba(99,102,241,.25), 0 10px 25px rgba(2,6,23,.18)' : obterSombraBuilder(props.elemento.sombra),
  ].filter(Boolean).join(', ')

  const estilo: CSSProperties = {
    left: pct(props.elemento.xPct),
    top: pct(props.elemento.yPct),
    width: pct(props.elemento.wPct),
    height: pct(props.elemento.hPct),
    zIndex: zIndexElemento,
    borderColor: possuiBordaVisivel ? props.elemento.corBorda.hex : undefined,
    color: possuiCorTextoCustom ? props.elemento.corTexto.hex : undefined,
    background: possuiCorFundoCustom ? props.elemento.corFundo.hex : undefined,
    opacity: props.elemento.opacity ?? 1,
    padding: (props.elemento.paddingPx ?? 0) + 'px',
    backdropFilter: props.elemento.blurBackdrop ? 'blur(8px)' : undefined,
    borderStyle: possuiBordaVisivel ? (ehContainer(props.elemento.tipo) ? 'dashed' : 'solid') : undefined,
    borderWidth: possuiBordaVisivel ? (props.elemento.borderWidthPx ?? 0) : 0,
    borderRadius: 0,
    position: 'absolute',
    boxShadow: sombraElemento,
    touchAction: 'none',
    userSelect: 'none',
  }

  return (
    <div
      ref={ref}
      data-elemento-id={props.elemento.id}
      className="select-none"
      style={estilo}
      onPointerDown={iniciarMover}
      onDoubleClick={(e) => {
        if (!props.selecionado) return
        if ((e.target as HTMLElement).closest('[data-handle="1"]')) return
        e.stopPropagation()
        // dupla no contorno: expandir até borda/peça mais próxima
        const alvo = detectarLadoDuploClique(e, ref.current)
        if (!alvo) return
        aplicarFitLado(alvo, props.elemento, props.mapa, (parcial) => props.onAtualizar(props.elemento.id, parcial))
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        props.onAbrirMenuContexto(props.elemento.id, e.clientX, e.clientY)
      }}
      onDragOver={(e) => {
        if (!ehContainer(props.elemento.tipo)) return
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'copy'
      }}
      onDrop={(e) => {
        if (!ehContainer(props.elemento.tipo)) return
        props.onDropNovo(e, props.elemento.id)
      }}
      onPointerDownCapture={(e) => {
        // traz para frente apenas quando o clique é no próprio bloco (não em filhos)
        if (e.target === e.currentTarget) props.onTrazerParaFrente(props.elemento.id)
      }}
    >
      {/* === LABEL | inicio === */}
<div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none">
  <div className="flex items-start gap-2 max-w-full">
    {props.elemento.descricao?.trim() ? (
      <span className="text-[10px] leading-tight font-extrabold px-2 py-1 rounded-2xl bg-white/70 border border-slate-200 text-slate-800 whitespace-pre-wrap break-words max-w-full">
        {props.elemento.descricao.trim()}
      </span>
    ) : null}
  </div>
</div>
      {/* === LABEL | fim === */}

      {/* === FILHOS | inicio === */}
      {filhos.map((f) => (
        <ElementoNoCanvas
          key={f.id}
          elemento={f}
          mapa={props.mapa}
          elementoSelecionadoId={props.elementoSelecionadoId}
          elementoSelecionadoIds={props.elementoSelecionadoIds}
          magnetismoAtivo={props.magnetismoAtivo}
          aninharAtivo={props.aninharAtivo}
          bordaLocalizacaoAtiva={props.bordaLocalizacaoAtiva}
          selecionado={props.elementoSelecionadoIds.includes(f.id)}
          onSelecionar={props.onSelecionar}
          onAtualizar={props.onAtualizar}
          onRemover={props.onRemover}
          onDuplicar={props.onDuplicar}
          onTrazerParaFrente={props.onTrazerParaFrente}
          onSolicitarConfirmacaoFilho={props.onSolicitarConfirmacaoFilho}
          onAbrirMenuContexto={props.onAbrirMenuContexto}
          onDropNovo={props.onDropNovo}
          onSetHoverPaiId={props.onSetHoverPaiId}
          onSetGuias={props.onSetGuias}
          onIniciarTransacaoHistorico={props.onIniciarTransacaoHistorico}
          onFinalizarTransacaoHistorico={props.onFinalizarTransacaoHistorico}
        />
      ))}
      {/* === FILHOS | fim === */}

      {/* === HANDLES (BORDAS + CANTOS) | inicio === */}
      {props.selecionado && !props.elemento.resizeTravado ? (
        <>
          <HandleBorda dir="n" onDown={(e) => iniciarResize(e, 'n')} />
          <HandleBorda dir="s" onDown={(e) => iniciarResize(e, 's')} />
          <HandleBorda dir="e" onDown={(e) => iniciarResize(e, 'e')} />
          <HandleBorda dir="w" onDown={(e) => iniciarResize(e, 'w')} />

          <HandleCanto dir="nw" onDown={(e) => iniciarResize(e, 'nw')} />
          <HandleCanto dir="ne" onDown={(e) => iniciarResize(e, 'ne')} />
          <HandleCanto dir="sw" onDown={(e) => iniciarResize(e, 'sw')} />
          <HandleCanto dir="se" onDown={(e) => iniciarResize(e, 'se')} />
        </>
      ) : null}
      {/* === HANDLES (BORDAS + CANTOS) | fim === */}
    </div>
  )
}

function HandleBorda(props: { dir: 'n' | 's' | 'e' | 'w'; onDown: (e: React.PointerEvent) => void }) {
  const base = 'absolute z-[70] bg-indigo-500/10'
  const map: Record<string, { className: string; cursor: string }> = {
    n: { className: 'left-3 right-3 top-0 h-1.5', cursor: 'ns-resize' },
    s: { className: 'left-3 right-3 bottom-0 h-1.5', cursor: 'ns-resize' },
    e: { className: 'top-3 bottom-3 right-0 w-1.5', cursor: 'ew-resize' },
    w: { className: 'top-3 bottom-3 left-0 w-1.5', cursor: 'ew-resize' },
  }
  const cfg = map[props.dir]
  return (
    <div
      data-handle="1"
      className={base + ' ' + cfg.className}
      style={{ cursor: cfg.cursor }}
      onPointerDown={props.onDown}
    />
  )
}

function HandleCanto(props: { dir: 'nw' | 'ne' | 'sw' | 'se'; onDown: (e: React.PointerEvent) => void }) {
  const base = 'absolute z-[80] w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow'
  const map: Record<string, { className: string; cursor: string }> = {
    nw: { className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2', cursor: 'nwse-resize' },
    ne: { className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2', cursor: 'nesw-resize' },
    sw: { className: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2', cursor: 'nesw-resize' },
    se: { className: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2', cursor: 'nwse-resize' },
  }
  const cfg = map[props.dir]
  return (
    <div
      data-handle="1"
      className={base + ' ' + cfg.className}
      style={{ cursor: cfg.cursor }}
      onPointerDown={props.onDown}
    />
  )
}
// === ELEMENTO NO CANVAS | fim ===
// === CANVAS | fim ===
