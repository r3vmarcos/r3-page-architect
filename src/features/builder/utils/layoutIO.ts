import type { CorAplicada, ElementoBuilder, EstadoBuilder, ReferenciaBuilder, TipoElemento, TipoPresetResolucao, TipoStack } from '@/types/tiposBuilder'

export type SnapshotBuilder = Pick<
  EstadoBuilder,
  'stack' | 'presetResolucao' | 'resolucao' | 'magnetismoAtivo' | 'aninharAtivo' | 'elementos' | 'elementoSelecionadoId' | 'referencias' | 'referenciaSelecionadaId'
>

export type ClipboardElementos = {
  raiz: ElementoBuilder
  filhos: ElementoBuilder[]
}

type ArquivoLayout = {
  versao: 'layout_v2'
  geradoEm: string
  payload: SnapshotBuilder
}

const SNAPSHOT_PADRAO: SnapshotBuilder = {
  stack: 'HTML + Tailwind',
  presetResolucao: 'Desktop 1920x1080',
  resolucao: { larguraPx: 1920, alturaPx: 1080, colunas: 160, linhas: 90, mostrarGrade: true },
  magnetismoAtivo: true,
  aninharAtivo: true,
  elementos: [],
  elementoSelecionadoId: null,
  referencias: [],
  referenciaSelecionadaId: null,
}

const COR_BORDA_PADRAO: CorAplicada = { tokenTailwind: null, hex: 'transparent' }
const COR_TEXTO_PADRAO: CorAplicada = { tokenTailwind: null, hex: 'inherit' }
const COR_FUNDO_PADRAO: CorAplicada = { tokenTailwind: null, hex: 'transparent' }

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function lerNumero(valor: unknown, fallback: number) {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : fallback
}

function lerTexto(valor: unknown, fallback = '') {
  return typeof valor === 'string' ? valor : fallback
}

function gerarIdUnico(idsExistentes?: Set<string>) {
  let id = ''
  do {
    id = 'el_' + Math.random().toString(36).slice(2, 10)
  } while (idsExistentes?.has(id))
  idsExistentes?.add(id)
  return id
}

function normalizarCor(valor: unknown, fallback: CorAplicada): CorAplicada {
  if (!ehObjeto(valor)) return { ...fallback }
  return {
    tokenTailwind: typeof valor.tokenTailwind === 'string' ? valor.tokenTailwind : null,
    hex: lerTexto(valor.hex, fallback.hex),
  }
}

export function clonarElementoBuilder(elemento: ElementoBuilder): ElementoBuilder {
  return {
    ...elemento,
    corBorda: { ...elemento.corBorda },
    corTexto: { ...elemento.corTexto },
    corFundo: { ...elemento.corFundo },
    props: ehObjeto(elemento.props) ? { ...elemento.props } : {},
  }
}

function normalizarElementoBuilder(valor: unknown): ElementoBuilder | null {
  if (!ehObjeto(valor)) return null

  return {
    id: lerTexto(valor.id, gerarIdUnico()),
    tipo: lerTexto(valor.tipo, 'tag_div') as TipoElemento,
    nomeCustom: lerTexto(valor.nomeCustom),
    descricao: lerTexto(valor.descricao),
    paiId: typeof valor.paiId === 'string' ? valor.paiId : null,
    xPct: clamp(lerNumero(valor.xPct, 10), 0, 100),
    yPct: clamp(lerNumero(valor.yPct, 10), 0, 100),
    wPct: clamp(lerNumero(valor.wPct, 5), 1, 100),
    hPct: clamp(lerNumero(valor.hPct, 5), 1, 100),
    zIndex: lerNumero(valor.zIndex, 0),
    corBorda: normalizarCor(valor.corBorda, COR_BORDA_PADRAO),
    corTexto: normalizarCor(valor.corTexto, COR_TEXTO_PADRAO),
    corFundo: normalizarCor(valor.corFundo, COR_FUNDO_PADRAO),
    resizeTravado: !!valor.resizeTravado,
    proporcaoTravada: !!valor.proporcaoTravada,
    moverTravado: !!valor.moverTravado,
    paddingPx: lerNumero(valor.paddingPx, 0),
    gapPx: lerNumero(valor.gapPx, 0),
    borderWidthPx: lerNumero(valor.borderWidthPx, 0),
    radiusPx: lerNumero(valor.radiusPx, 14),
    opacity: lerNumero(valor.opacity, 1),
    sombra: valor.sombra === 'sm' || valor.sombra === 'md' || valor.sombra === 'lg' || valor.sombra === 'nenhuma' ? valor.sombra : 'nenhuma',
    blurBackdrop: !!valor.blurBackdrop,
    margemAtiva: !!valor.margemAtiva,
    margemTopoPx: lerNumero(valor.margemTopoPx, 0),
    margemBaixoPx: lerNumero(valor.margemBaixoPx, 0),
    margemEsqPx: lerNumero(valor.margemEsqPx, 0),
    margemDirPx: lerNumero(valor.margemDirPx, 0),
    instrucoes: lerTexto(valor.instrucoes),
    props: ehObjeto(valor.props) ? { ...valor.props } : {},
  }
}

function normalizarElementos(elementos: unknown): ElementoBuilder[] {
  if (!Array.isArray(elementos)) return []
  return elementos
    .map((item) => normalizarElementoBuilder(item))
    .filter((item): item is ElementoBuilder => !!item)
}

export function clonarReferenciaBuilder(referencia: ReferenciaBuilder): ReferenciaBuilder {
  return { ...referencia }
}

function normalizarReferenciaBuilder(valor: unknown): ReferenciaBuilder | null {
  if (!ehObjeto(valor)) return null

  const aspectRatio = lerNumero(valor.aspectRatio, 1)

  return {
    id: lerTexto(valor.id, gerarIdUnico()),
    nome: lerTexto(valor.nome, 'Referência'),
    src: lerTexto(valor.src),
    xPct: clamp(lerNumero(valor.xPct, 5), 0, 100),
    yPct: clamp(lerNumero(valor.yPct, 5), 0, 100),
    wPct: clamp(lerNumero(valor.wPct, 45), 1, 100),
    hPct: clamp(lerNumero(valor.hPct, 45 / Math.max(0.01, aspectRatio)), 1, 100),
    aspectRatio: Math.max(0.01, aspectRatio),
    opacity: clamp(lerNumero(valor.opacity, 0.55), 0.05, 1),
  }
}

function normalizarReferencias(referencias: unknown): ReferenciaBuilder[] {
  if (!Array.isArray(referencias)) return []
  return referencias
    .map((item) => normalizarReferenciaBuilder(item))
    .filter((item): item is ReferenciaBuilder => !!item && item.src.trim().length > 0)
}

export function criarSnapshotBuilder(snapshot: SnapshotBuilder): SnapshotBuilder {
  const elementos = snapshot.elementos.map((elemento) => clonarElementoBuilder(elemento))
  const ids = new Set(elementos.map((elemento) => elemento.id))
  const elementoSelecionadoId = snapshot.elementoSelecionadoId && ids.has(snapshot.elementoSelecionadoId) ? snapshot.elementoSelecionadoId : null
  const referencias = snapshot.referencias.map((referencia) => clonarReferenciaBuilder(referencia))
  const idsReferencias = new Set(referencias.map((referencia) => referencia.id))
  const referenciaSelecionadaId = snapshot.referenciaSelecionadaId && idsReferencias.has(snapshot.referenciaSelecionadaId) ? snapshot.referenciaSelecionadaId : null

  return {
    stack: snapshot.stack,
    presetResolucao: snapshot.presetResolucao,
    resolucao: { ...snapshot.resolucao },
    magnetismoAtivo: snapshot.magnetismoAtivo,
    aninharAtivo: snapshot.aninharAtivo,
    elementos,
    elementoSelecionadoId,
    referencias,
    referenciaSelecionadaId,
  }
}

export function criarArquivoLayout(snapshot: SnapshotBuilder): ArquivoLayout {
  return {
    versao: 'layout_v2',
    geradoEm: new Date().toISOString(),
    payload: criarSnapshotBuilder(snapshot),
  }
}

export function extrairSnapshotBuilder(data: unknown): SnapshotBuilder | null {
  const bruto = ehObjeto(data) && 'payload' in data ? data.payload : data
  if (!ehObjeto(bruto)) return null

  const elementos = normalizarElementos(bruto.elementos)
  const ids = new Set(elementos.map((elemento) => elemento.id))
  const elementoSelecionadoId =
    typeof bruto.elementoSelecionadoId === 'string' && ids.has(bruto.elementoSelecionadoId) ? bruto.elementoSelecionadoId : null
  const referencias = normalizarReferencias(bruto.referencias)
  const idsReferencias = new Set(referencias.map((referencia) => referencia.id))
  const referenciaSelecionadaId =
    typeof bruto.referenciaSelecionadaId === 'string' && idsReferencias.has(bruto.referenciaSelecionadaId) ? bruto.referenciaSelecionadaId : null

  return {
    stack: lerTexto(bruto.stack, SNAPSHOT_PADRAO.stack) as TipoStack,
    presetResolucao: lerTexto(bruto.presetResolucao, SNAPSHOT_PADRAO.presetResolucao) as TipoPresetResolucao,
    resolucao: {
      larguraPx: lerNumero(bruto.resolucao && ehObjeto(bruto.resolucao) ? bruto.resolucao.larguraPx : undefined, SNAPSHOT_PADRAO.resolucao.larguraPx),
      alturaPx: lerNumero(bruto.resolucao && ehObjeto(bruto.resolucao) ? bruto.resolucao.alturaPx : undefined, SNAPSHOT_PADRAO.resolucao.alturaPx),
      colunas: lerNumero(bruto.resolucao && ehObjeto(bruto.resolucao) ? bruto.resolucao.colunas : undefined, SNAPSHOT_PADRAO.resolucao.colunas),
      linhas: lerNumero(bruto.resolucao && ehObjeto(bruto.resolucao) ? bruto.resolucao.linhas : undefined, SNAPSHOT_PADRAO.resolucao.linhas),
      mostrarGrade: bruto.resolucao && ehObjeto(bruto.resolucao) ? !!bruto.resolucao.mostrarGrade : SNAPSHOT_PADRAO.resolucao.mostrarGrade,
    },
    magnetismoAtivo: typeof bruto.magnetismoAtivo === 'boolean' ? bruto.magnetismoAtivo : SNAPSHOT_PADRAO.magnetismoAtivo,
    aninharAtivo: typeof bruto.aninharAtivo === 'boolean' ? bruto.aninharAtivo : SNAPSHOT_PADRAO.aninharAtivo,
    elementos,
    elementoSelecionadoId,
    referencias,
    referenciaSelecionadaId,
  }
}

export function mesclarSnapshotBuilder(base: SnapshotBuilder, recebido: SnapshotBuilder, offset = 2): SnapshotBuilder {
  const idsExistentes = new Set(base.elementos.map((elemento) => elemento.id))
  const mapaIds = new Map<string, string>()

  recebido.elementos.forEach((elemento) => {
    mapaIds.set(elemento.id, gerarIdUnico(idsExistentes))
  })

  const novosElementos = recebido.elementos.map((elemento) => {
    const clone = clonarElementoBuilder(elemento)
    const novoId = mapaIds.get(elemento.id) as string
    const novoPaiId = elemento.paiId ? mapaIds.get(elemento.paiId) ?? null : null

    return {
      ...clone,
      id: novoId,
      paiId: novoPaiId,
      xPct: clamp(clone.xPct + offset, 0, Math.max(0, 100 - clone.wPct)),
      yPct: clamp(clone.yPct + offset, 0, Math.max(0, 100 - clone.hPct)),
    }
  })

  const elementoSelecionadoId =
    (recebido.elementoSelecionadoId ? mapaIds.get(recebido.elementoSelecionadoId) : null) ??
    (novosElementos[0]?.id ?? base.elementoSelecionadoId)
  const idsReferenciasExistentes = new Set(base.referencias.map((referencia) => referencia.id))
  const novasReferencias = recebido.referencias.map((referencia) => ({
    ...clonarReferenciaBuilder(referencia),
    id: gerarIdUnico(idsReferenciasExistentes),
    xPct: clamp(referencia.xPct + offset, 0, Math.max(0, 100 - referencia.wPct)),
    yPct: clamp(referencia.yPct + offset, 0, Math.max(0, 100 - referencia.hPct)),
  }))
  const referenciaSelecionadaId = novasReferencias[0]?.id ?? base.referenciaSelecionadaId

  return criarSnapshotBuilder({
    ...base,
    elementos: [...base.elementos.map((elemento) => clonarElementoBuilder(elemento)), ...novosElementos],
    elementoSelecionadoId,
    referencias: [...base.referencias.map((referencia) => clonarReferenciaBuilder(referencia)), ...novasReferencias],
    referenciaSelecionadaId,
  })
}

export function coletarSubarvoreBuilder(elementos: ElementoBuilder[], raizId: string) {
  const filhos: ElementoBuilder[] = []
  const fila = [raizId]

  while (fila.length > 0) {
    const atual = fila.shift() as string
    elementos.forEach((elemento) => {
      if (elemento.paiId !== atual) return
      filhos.push(clonarElementoBuilder(elemento))
      fila.push(elemento.id)
    })
  }

  return filhos
}

export function clonarClipboardNaPosicao(clipboard: ClipboardElementos, xPct: number, yPct: number, idsOcupados: Iterable<string> = []) {
  const idsExistentes = new Set<string>(idsOcupados)
  const mapaIds = new Map<string, string>()

  mapaIds.set(clipboard.raiz.id, gerarIdUnico(idsExistentes))
  clipboard.filhos.forEach((filho) => {
    mapaIds.set(filho.id, gerarIdUnico(idsExistentes))
  })

  const raizNova = clonarElementoBuilder(clipboard.raiz)
  const novoIdRaiz = mapaIds.get(clipboard.raiz.id) as string

  const elementoRaiz: ElementoBuilder = {
    ...raizNova,
    id: novoIdRaiz,
    paiId: null,
    xPct: clamp(xPct, 0, Math.max(0, 100 - raizNova.wPct)),
    yPct: clamp(yPct, 0, Math.max(0, 100 - raizNova.hPct)),
  }

  const filhos = clipboard.filhos.map((filho) => {
    const clone = clonarElementoBuilder(filho)
    return {
      ...clone,
      id: mapaIds.get(filho.id) as string,
      paiId: filho.paiId ? mapaIds.get(filho.paiId) ?? elementoRaiz.id : elementoRaiz.id,
    }
  })

  return {
    elementos: [elementoRaiz, ...filhos],
    elementoSelecionadoId: elementoRaiz.id,
  }
}
