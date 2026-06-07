import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ehContainer } from '@/features/builder/estadoBuilder'
import type { ElementoBuilder, ReferenciaBuilder } from '@/types/tiposBuilder'
import { extrairSnapshotBuilder, type SnapshotBuilder } from '@/features/builder/utils/layoutIO'
import { ehVoidTagBuilder, montarClasseBuilder, obterSombraBuilder, tipoBuilderParaTag } from '@/features/builder/utils/renderBuilder'

// === VIEWPAGE (MONITOR) | inicio ===
// Objetivo: espelhar fielmente o Canvas (sem UI do editor).
// Estratégia:
// - Recebe snapshot realtime via localStorage + BroadcastChannel + postMessage
// - Renderiza absolutamente os elementos com o MESMO estilo base do Canvas
// - Mantém a página limpa (sem bordas/menus/handles)
// Atalhos:
// - Tecla "D": alterna modo debug (rótulos/outline)

// === CONSTANTES REALTIME | inicio ===
const KEY_SNAPSHOT = 'page_architect_realtime_snapshot_v2'
const KEY_PULSE = 'page_architect_realtime_pulse_v2'
const NOME_CANAL = 'page_architect_realtime_v2'
// === CONSTANTES REALTIME | fim ===

type SnapshotMonitor = SnapshotBuilder

function pct(n: number) {
  return `${n}%`
}

function lerSnapshotLocalStorage(): SnapshotMonitor | null {
  try {
    const raw = localStorage.getItem(KEY_SNAPSHOT)
    if (!raw) return null
    return extrairSnapshotBuilder(JSON.parse(raw))
  } catch {
    return null
  }
}

export default function ViewPage() {
  // === ESTADO | inicio ===
  const [snapshot, setSnapshot] = useState<SnapshotMonitor | null>(() => lerSnapshotLocalStorage())
  const [debug, setDebug] = useState<boolean>(() => localStorage.getItem('page_architect_monitor_debug') === '1')
  const ultimoPulseRef = useRef<string | null>(null)
  // === ESTADO | fim ===

  const larguraCanvas = snapshot?.resolucao?.larguraPx ?? 1366
  const alturaCanvas = snapshot?.resolucao?.alturaPx ?? 768

  // === REALTIME (snapshot + pulse + broadcast + message) | inicio ===
  useEffect(() => {
    function aplicarSnapshot(s: SnapshotMonitor | null) {
      if (!s) return
      setSnapshot(s)
    }

    function tentarAtualizarDoStorage() {
      const snap = lerSnapshotLocalStorage()
      if (snap) aplicarSnapshot(snap)
    }

    // 01) leitura inicial
    tentarAtualizarDoStorage()

    // 02) storage event (quando Builder grava)
    function onStorage(ev: StorageEvent) {
      if (ev.key !== KEY_PULSE && ev.key !== KEY_SNAPSHOT) return
      tentarAtualizarDoStorage()
    }
    window.addEventListener('storage', onStorage)

    // 03) BroadcastChannel (se disponível)
    let canal: BroadcastChannel | null = null
    if (typeof window.BroadcastChannel !== 'undefined') {
      canal = new BroadcastChannel(NOME_CANAL)
      canal.onmessage = (ev) => {
        const data: any = ev.data
        if (!data) return
        if (data.tipo === 'snapshot' && data.payload) {
          aplicarSnapshot(data.payload as SnapshotMonitor)
        }
      }
      try {
        canal.postMessage({ tipo: 'request_snapshot' })
      } catch {}
    }

    // 04) postMessage (quando abriu via window.open)
    function onMessage(ev: MessageEvent) {
      const data: any = ev.data
      if (!data) return
      if (data.tipo === 'snapshot' && data.payload) {
        aplicarSnapshot(data.payload as SnapshotMonitor)
      }
    }
    window.addEventListener('message', onMessage)

    // 05) pedir snapshot ao opener (se existir)
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ tipo: 'request_snapshot' }, '*')
      }
    } catch {}

    // 06) poll pulse (blindagem)
    const t = window.setInterval(() => {
      try {
        const p = localStorage.getItem(KEY_PULSE)
        if (p && p !== ultimoPulseRef.current) {
          ultimoPulseRef.current = p
          tentarAtualizarDoStorage()
        }
      } catch {}
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ tipo: 'request_snapshot' }, '*')
        }
      } catch {}
      try {
        canal?.postMessage({ tipo: 'request_snapshot' })
      } catch {}
    }, 250)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('message', onMessage)
      window.clearInterval(t)
      try {
        canal?.close()
      } catch {}
    }
  }, [])
  // === REALTIME (snapshot + pulse + broadcast + message) | fim ===

  // === DEBUG (D) | inicio ===
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== 'd') return
      setDebug((v) => {
        const nv = !v
        localStorage.setItem('page_architect_monitor_debug', nv ? '1' : '0')
        return nv
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  // === DEBUG (D) | fim ===

  // === SCROLL DO MONITOR | inicio ===
  useEffect(() => {
    const overflowHtmlAnterior = document.documentElement.style.overflow
    const overflowBodyAnterior = document.body.style.overflow
    const larguraBodyAnterior = document.body.style.width
    const alturaBodyAnterior = document.body.style.height
    const minLarguraRootAnterior = document.documentElement.style.minWidth
    const minAlturaRootAnterior = document.documentElement.style.minHeight

    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'
    document.body.style.width = `${larguraCanvas}px`
    document.body.style.height = `${alturaCanvas}px`
    document.documentElement.style.minWidth = `${larguraCanvas}px`
    document.documentElement.style.minHeight = `${alturaCanvas}px`

    return () => {
      document.documentElement.style.overflow = overflowHtmlAnterior
      document.body.style.overflow = overflowBodyAnterior
      document.body.style.width = larguraBodyAnterior
      document.body.style.height = alturaBodyAnterior
      document.documentElement.style.minWidth = minLarguraRootAnterior
      document.documentElement.style.minHeight = minAlturaRootAnterior
    }
  }, [larguraCanvas, alturaCanvas])
  // === SCROLL DO MONITOR | fim ===

  // === ÁRVORE | inicio ===
  const filhosPorPai = useMemo(() => {
    const m = new Map<string | null, ElementoBuilder[]>()
    const elementos = snapshot?.elementos ?? []

    function add(p: string | null, e: ElementoBuilder) {
      const arr = m.get(p) ?? []
      arr.push(e)
      m.set(p, arr)
    }

    elementos.forEach((e) => add(e.paiId, e))

    for (const [k, arr] of m.entries()) {
      arr.sort((a, b) => (a.yPct !== b.yPct ? a.yPct - b.yPct : a.xPct - b.xPct))
      m.set(k, arr)
    }

    return m
  }, [snapshot?.elementos])

  const raiz = filhosPorPai.get(null) ?? []
  const referencias = snapshot?.referencias ?? []
  const semElementos = !snapshot || ((snapshot.elementos?.length ?? 0) === 0 && referencias.length === 0)
  // === ÁRVORE | fim ===

  // === ESTILO ROOT (TELA LIMPA) | inicio ===
  const estiloRoot: CSSProperties = {
    width: `${larguraCanvas}px`,
    minWidth: '100vw',
    minHeight: `${alturaCanvas}px`,
    background: '#ffffff',
  }

  const estiloCanvas: CSSProperties = {
    width: `${larguraCanvas}px`,
    height: `${alturaCanvas}px`,
    position: 'relative',
    background: '#ffffff',
    overflow: 'hidden',
    outline: debug ? '1px dashed rgba(16,185,129,0.55)' : undefined,
  }
  // === ESTILO ROOT (TELA LIMPA) | fim ===

  return (
    <div style={estiloRoot}>
      <div style={estiloCanvas}>
        {referencias.map((referencia) => (
          <RenderReferencia key={referencia.id} referencia={referencia} />
        ))}

        {raiz.map((e) => (
          <RenderElemento key={e.id} elemento={e} filhosPorPai={filhosPorPai} debug={debug} />
        ))}

        {semElementos ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              color: '#64748b',
            }}
          >
            Monitor pronto. Adicione componentes no Builder.
          </div>
        ) : null}
      </div>
    </div>
  )
}

function RenderReferencia(props: { referencia: ReferenciaBuilder }) {
  const r = props.referencia

  const estilo: CSSProperties = {
    position: 'absolute',
    left: pct(r.xPct),
    top: pct(r.yPct),
    width: pct(r.wPct),
    height: pct(r.hPct),
    opacity: r.opacity,
    zIndex: 0,
    pointerEvents: 'none',
  }

  return <img src={r.src} alt={r.nome} draggable={false} style={estilo} />
}

function RenderElemento(props: { elemento: ElementoBuilder; filhosPorPai: Map<string | null, ElementoBuilder[]>; debug: boolean }) {
  const e = props.elemento
  const tag = tipoBuilderParaTag(e.tipo)
  const Tag = (ehVoidTagBuilder(tag) ? 'div' : tag) as any

  const filhos = props.filhosPorPai.get(e.id) ?? []
  const temFilhos = filhos.length > 0

  // === ESTILO (IGUAL AO CANVAS) | inicio ===
  const zIndexElemento = typeof e.zIndex === 'number' ? e.zIndex : 0
  const possuiBordaVisivel = (e.borderWidthPx ?? 0) > 0 && e.corBorda.hex !== 'transparent'
  const possuiCorTextoCustom = e.corTexto.hex !== 'inherit'
  const possuiCorFundoCustom = e.corFundo.hex !== 'transparent'

  const estilo: CSSProperties = {
    position: 'absolute',
    left: pct(e.xPct),
    top: pct(e.yPct),
    width: pct(e.wPct),
    height: pct(e.hPct),
    zIndex: zIndexElemento,
    borderColor: possuiBordaVisivel ? e.corBorda.hex : undefined,
    color: possuiCorTextoCustom ? e.corTexto.hex : undefined,
    background: possuiCorFundoCustom ? e.corFundo.hex : undefined,
    opacity: e.opacity ?? 1,
    padding: (e.paddingPx ?? 0) + 'px',
    backdropFilter: e.blurBackdrop ? 'blur(8px)' : undefined,
    borderStyle: possuiBordaVisivel ? (ehContainer(e.tipo) ? 'dashed' : 'solid') : undefined,
    borderWidth: possuiBordaVisivel ? (e.borderWidthPx ?? 0) : 0,
    borderRadius: e.radiusPx ?? 14,
    boxShadow: e.sombra !== 'nenhuma' ? obterSombraBuilder(e.sombra) : undefined,
    overflow: 'hidden',
  }
  // === ESTILO (IGUAL AO CANVAS) | fim ===

  const cls = montarClasseBuilder(e)

  // === CONTEÚDO (PREVIEW) | inicio ===
  function renderConteudo() {
    const texto = typeof e.props?.texto === 'string' ? e.props.texto : ''

    if (e.tipo === 'navbar') {
      const logo = typeof e.props?.logo === 'string' ? e.props.logo : 'Logo'
      const links: string[] = Array.isArray(e.props?.links) ? e.props.links : ['Início', 'Sobre', 'Contato']
      const cta = typeof e.props?.cta === 'string' ? e.props.cta : 'Login'
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 14 }}>{logo}</div>
          <div style={{ display: 'flex', gap: 10, fontSize: 12, opacity: 0.9 }}>
            {links.slice(0, 6).map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <button style={{ padding: '6px 10px', borderRadius: 10, background: '#4f46e5', color: '#fff', fontWeight: 900, fontSize: 12 }}>
            {cta}
          </button>
        </div>
      )
    }

    if (e.tipo === 'botao' || e.tipo === 'tag_button') {
      const label = (texto || (e.props as any)?.label || 'Botão') as string
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button style={{ padding: '8px 12px', borderRadius: 12, background: '#4f46e5', color: '#fff', fontWeight: 900, fontSize: 12 }}>
            {label}
          </button>
        </div>
      )
    }

    if (e.tipo === 'titulo' || e.tipo.startsWith('tag_h')) {
      const label = texto || 'Título'
      return <div style={{ fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', height: '100%' }}>{label}</div>
    }

    if (e.tipo === 'texto' || e.tipo === 'tag_p' || e.tipo === 'tag_span') {
      const label = texto || 'Texto...'
      return <div style={{ fontSize: 12, lineHeight: 1.2, opacity: 0.95 }}>{label}</div>
    }

    if (e.tipo === 'input' || e.tipo === 'tag_input') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(15,23,42,0.15)',
              fontSize: 12,
              color: '#64748b',
            }}
          >
            Input
          </div>
        </div>
      )
    }

    return null
  }
  // === CONTEÚDO (PREVIEW) | fim ===

  return (
    <Tag className={cls} style={estilo} data-tag={ehVoidTagBuilder(tag) ? tag : undefined}>
      {props.debug ? (
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: 6,
            zIndex: 999,
            fontSize: 10,
            fontWeight: 900,
            color: '#0f172a',
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 999,
            padding: '2px 8px',
            pointerEvents: 'none',
          }}
        >
          {e.descricao?.trim() ? e.descricao.trim() : e.tipo}
        </div>
      ) : null}

      {temFilhos ? (
        <>
          {filhos.map((f) => (
            <RenderElemento key={f.id} elemento={f} filhosPorPai={props.filhosPorPai} debug={props.debug} />
          ))}
        </>
      ) : (
        renderConteudo()
      )}
    </Tag>
  )
}
// === VIEWPAGE (MONITOR) | fim ===
