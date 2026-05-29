import type { ElementoBuilder, TipoElemento } from '@/types/tiposBuilder'

export function obterSombraBuilder(sombra: ElementoBuilder['sombra']) {
  if (sombra === 'nenhuma') return 'none'
  if (sombra === 'sm') return '0 2px 8px rgba(2,6,23,.10)'
  if (sombra === 'lg') return '0 18px 45px rgba(2,6,23,.22)'
  return '0 6px 14px rgba(2,6,23,.12)'
}

export function tipoBuilderParaTag(tipo: TipoElemento | string) {
  if (tipo.startsWith('tag_')) return tipo.replace('tag_', '')
  if (tipo === 'navbar') return 'nav'
  if (tipo === 'footer') return 'footer'
  if (tipo === 'hero') return 'section'
  if (tipo === 'sidebar') return 'aside'
  return 'div'
}

export function ehVoidTagBuilder(tag: string) {
  return ['br', 'hr', 'img', 'source', 'picture', 'audio', 'video', 'iframe', 'canvas', 'svg', 'template', 'slot'].includes(tag)
}

export function montarClasseBuilder(elemento: ElementoBuilder) {
  const classes: string[] = []

  if (elemento.nomeCustom) classes.push(elemento.nomeCustom)
  if (elemento.corTexto?.tokenTailwind?.startsWith('text-')) classes.push(elemento.corTexto.tokenTailwind)
  if (elemento.corBorda?.tokenTailwind?.startsWith('border-')) classes.push(elemento.corBorda.tokenTailwind)
  if (elemento.corFundo?.tokenTailwind?.startsWith('bg-')) classes.push(elemento.corFundo.tokenTailwind)

  return classes.join(' ')
}
