// === TIPOS BUILDER | inicio ===
export type TipoStack =
  | 'HTML + Tailwind'
  | 'HTML + Bootstrap 5'
  | 'HTML + CSS puro'
  | 'React + Vite + Tailwind'
  | 'Next.js + Tailwind'
  | 'Vue 3 + Tailwind'
  | 'Angular + Tailwind'

export type TipoPresetResolucao =
  | 'Desktop 1920x1080'
  | 'Notebook 1366x768'
  | 'Tablet 1024x768'
  | 'Tablet 834x1112'
  | 'Mobile 390x844'
  | 'Mobile 360x800'
  | 'Ultrawide 2560x1080'
  | 'Ultrawide 3440x1440'
  | '4K 3840x2160'
  | 'Custom'

export type TipoElemento =
  | 'navbar'
  | 'hero'
  | 'secao'
  | 'grid'
  | 'card'
  | 'sidebar'
  | 'footer'
  | 'modal'
  | 'drawer'
  | 'tabs'
  | 'pricing'
  | 'faq'
  | 'galeria'
  | 'lista'
  | 'tabela'
  | 'botao'
  | 'texto'
  | 'titulo'
  | 'imagem'
  | 'video'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'badge'
  | 'icone'
  | 'divisor'
  | 'progresso'
// === HTML5 SEMÂNTICOS | inicio ===
| 'tag_header'
| 'tag_nav'
| 'tag_main'
| 'tag_section'
| 'tag_article'
| 'tag_aside'
| 'tag_footer'
| 'tag_div'
// === HTML5 SEMÂNTICOS | fim ===

// === TEXTO | inicio ===
| 'tag_h1'
| 'tag_h2'
| 'tag_h3'
| 'tag_h4'
| 'tag_h5'
| 'tag_h6'
| 'tag_p'
| 'tag_span'
| 'tag_strong'
| 'tag_em'
| 'tag_blockquote'
| 'tag_pre'
| 'tag_code'
| 'tag_br'
| 'tag_hr'
// === TEXTO | fim ===

// === LISTAS | inicio ===
| 'tag_ul'
| 'tag_ol'
| 'tag_li'
| 'tag_dl'
| 'tag_dt'
| 'tag_dd'
// === LISTAS | fim ===

// === LINKS | inicio ===
| 'tag_a'
// === LINKS | fim ===

// === MIDIA | inicio ===
| 'tag_img'
| 'tag_picture'
| 'tag_source'
| 'tag_figure'
| 'tag_figcaption'
| 'tag_audio'
| 'tag_iframe'
// === MIDIA | fim ===

// === FORMULÁRIOS | inicio ===
| 'tag_form'
| 'tag_label'
| 'tag_button'
  | 'tag_input'
| 'tag_fieldset'
| 'tag_legend'
| 'tag_datalist'
| 'tag_option'
| 'tag_optgroup'
| 'tag_meter'
// === FORMULÁRIOS | fim ===

// === TABELAS | inicio ===
| 'tag_table'
| 'tag_thead'
| 'tag_tbody'
| 'tag_tfoot'
| 'tag_tr'
| 'tag_th'
| 'tag_td'
| 'tag_caption'
// === TABELAS | fim ===

// === MODERNOS | inicio ===
| 'tag_details'
| 'tag_summary'
| 'tag_dialog'
| 'tag_mark'
| 'tag_time'
| 'tag_address'
| 'tag_abbr'
| 'tag_cite'
// === MODERNOS | fim ===

// === ESPECIAIS | inicio ===
| 'tag_canvas'
| 'tag_svg'
| 'tag_template'
| 'tag_slot'
// === ESPECIAIS | fim ===

export type TipoAlvoCor = 'borda' | 'texto' | 'fundo'

export type CorAplicada = {
  tokenTailwind: string | null
  hex: string
}

export type ResoluacaoCustom = {
  larguraPx: number
  alturaPx: number
  colunas: number
  linhas: number
  mostrarGrade: boolean
}

export type ElementoBuilder = {
  id: string
  tipo: TipoElemento
  nomeCustom: string
  descricao: string
  paiId: string | null

  // === POSICIONAMENTO LIVRE | inicio ===
  // Guardado em % (0..100), sem snap
  xPct: number
  yPct: number
  wPct: number
  hPct: number
  // === POSICIONAMENTO LIVRE | fim ===

  zIndex: number

  // Cores
  corBorda: CorAplicada
  corTexto: CorAplicada
  corFundo: CorAplicada

  // Interações
  resizeTravado: boolean
  proporcaoTravada: boolean
  moverTravado: boolean

  // === ESTILO AVANÇADO | inicio ===
  paddingPx: number
  gapPx: number
  borderWidthPx: number
  radiusPx: number
  opacity: number
  sombra: 'nenhuma' | 'sm' | 'md' | 'lg'
  blurBackdrop: boolean
  // === ESTILO AVANÇADO | fim ===

  // === MARGENS (PROMPT) | inicio ===
  margemAtiva: boolean
  margemTopoPx: number
  margemBaixoPx: number
  margemEsqPx: number
  margemDirPx: number
  // === MARGENS (PROMPT) | fim ===

  // === INSTRUÇÕES (PROMPT) | inicio ===
  instrucoes: string
  // === INSTRUÇÕES (PROMPT) | fim ===

  // Props específicas (simples e extensível)
  props: Record<string, any>
}

export type EstadoBuilder = {
  stack: TipoStack
  presetResolucao: TipoPresetResolucao
  resolucao: ResoluacaoCustom
  magnetismoAtivo: boolean
  aninharAtivo: boolean
  bordaLocalizacaoAtiva: boolean
  elementos: ElementoBuilder[]
  elementoSelecionadoId: string | null
  elementoSelecionadoIds: string[]
}
// === TIPOS BUILDER | fim ===
