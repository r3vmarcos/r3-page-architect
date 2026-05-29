// === DATASETS CATÁLOGO | inicio ===
export type ItemCatalogo = {
  id: string
  nome: string
  descricao: string
  prompt: string
  // preview em HTML (básico) ou JSX-like (react) renderizado como blocos
  previewTipo: 'html' | 'blocos'
  previewHtml?: string
  previewBlocos?: Array<{ tipo: 'barra'|'card'|'botao'|'texto'|'input'|'badge'|'linha'|'imagem'; destaque?: boolean; label?: string }>
}

export const catalogoPro: ItemCatalogo[] = [
      {
        id: 'p_header',
        nome: '<header> (Cabeçalho)',
        descricao: 'Área de topo para marca, navegação e CTA.',
        prompt: `Crie um <header> semântico com logotipo à esquerda, navegação ao centro e botão de ação à direita. Responsivo com menu no mobile.`,
        previewTipo: 'html',
        previewHtml: `<header class="w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
  <strong class="text-sm">LOGO</strong>
  <nav class="hidden sm:flex gap-3 text-xs text-slate-600">
    <a class="hover:text-indigo-600" href="#">Início</a><a class="hover:text-indigo-600" href="#">Sobre</a><a class="hover:text-indigo-600" href="#">Contato</a>
  </nav>
  <button class="bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-lg">Entrar</button>
</header>`,
      },
      {
        id: 'p_nav',
        nome: '<nav> (Navegação)',
        descricao: 'Bloco semântico de links de navegação.',
        prompt: `Crie um <nav> com links horizontais, com estado ativo e hover; no mobile, vire uma lista vertical.`,
        previewTipo: 'html',
        previewHtml: `<nav class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex gap-3 text-xs text-slate-700">
  <a class="font-bold text-indigo-600" href="#">Home</a>
  <a class="hover:text-indigo-600" href="#">Serviços</a>
  <a class="hover:text-indigo-600" href="#">Contato</a>
</nav>`,
      },
      {
        id: 'p_main',
        nome: '<main> (Conteúdo principal)',
        descricao: 'Contém o conteúdo principal da página.',
        prompt: `Crie um <main> com layout em 2 colunas (conteúdo + sidebar) e responsivo para 1 coluna no mobile.`,
        previewTipo: 'html',
        previewHtml: `<main class="w-full bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
  <section class="sm:col-span-2 bg-slate-50 rounded-lg p-3 text-xs text-slate-700">Conteúdo</section>
  <aside class="bg-slate-50 rounded-lg p-3 text-xs text-slate-700">Sidebar</aside>
</main>`,
      },
      {
        id: 'p_h1',
        nome: '<h1> (Título)',
        descricao: 'Título nível 1.',
        prompt: `Crie um <h1> com tipografia proporcional ao nível e bom espaçamento; usar fonte Inter e hierarquia visual clara.`,
        previewTipo: 'html',
        previewHtml: `<h1 class="text-2xl font-extrabold text-slate-900">
  Título H1
</h1>`,
      },
      {
        id: 'p_h2',
        nome: '<h2> (Título)',
        descricao: 'Título nível 2.',
        prompt: `Crie um <h2> com tipografia proporcional ao nível e bom espaçamento; usar fonte Inter e hierarquia visual clara.`,
        previewTipo: 'html',
        previewHtml: `<h2 class="text-xl font-extrabold text-slate-900">
  Título H2
</h2>`,
      },
      {
        id: 'p_h3',
        nome: '<h3> (Título)',
        descricao: 'Título nível 3.',
        prompt: `Crie um <h3> com tipografia proporcional ao nível e bom espaçamento; usar fonte Inter e hierarquia visual clara.`,
        previewTipo: 'html',
        previewHtml: `<h3 class="text-lg font-extrabold text-slate-900">
  Título H3
</h3>`,
      },
      {
        id: 'p_h4',
        nome: '<h4> (Título)',
        descricao: 'Título nível 4.',
        prompt: `Crie um <h4> com tipografia proporcional ao nível e bom espaçamento; usar fonte Inter e hierarquia visual clara.`,
        previewTipo: 'html',
        previewHtml: `<h4 class="text-base font-extrabold text-slate-900">
  Título H4
</h4>`,
      },
      {
        id: 'p_h5',
        nome: '<h5> (Título)',
        descricao: 'Título nível 5.',
        prompt: `Crie um <h5> com tipografia proporcional ao nível e bom espaçamento; usar fonte Inter e hierarquia visual clara.`,
        previewTipo: 'html',
        previewHtml: `<h5 class="text-sm font-extrabold text-slate-900">
  Título H5
</h5>`,
      },
      {
        id: 'p_h6',
        nome: '<h6> (Título)',
        descricao: 'Título nível 6.',
        prompt: `Crie um <h6> com tipografia proporcional ao nível e bom espaçamento; usar fonte Inter e hierarquia visual clara.`,
        previewTipo: 'html',
        previewHtml: `<h6 class="text-xs font-extrabold text-slate-900">
  Título H6
</h6>`,
      },
      {
        id: 'p_p',
        nome: '<p> (Parágrafo)',
        descricao: 'Texto corrido.',
        prompt: `Crie um <p> com largura confortável (max-w), line-height adequado e cor neutra para leitura.`,
        previewTipo: 'html',
        previewHtml: `<p class="text-sm text-slate-600 leading-relaxed max-w-md">
  Texto de exemplo para leitura confortável em web design.
</p>`,
      },
{
  id: 'p_span',
  nome: '<span> (Inline)',
  descricao: 'Texto inline para detalhes.',
  prompt: `Crie um <span> inline com estilo sutil para informações secundárias.`,
  previewTipo: 'html',
  previewHtml: `<div class="text-sm text-slate-700">Total: <span class="text-slate-500 font-semibold">R$ 120,00</span></div>`,
},
{
  id: 'p_strong',
  nome: '<strong> (Negrito)',
  descricao: 'Ênfase semântica em negrito.',
  prompt: `Use <strong> para dar ênfase semântica em uma frase; mantenha contraste e consistência.`,
  previewTipo: 'html',
  previewHtml: `<p class="text-sm text-slate-700">Este é um texto com <strong class="text-slate-900">ênfase importante</strong> no meio.</p>`,
},
{
  id: 'p_em',
  nome: '<em> (Itálico)',
  descricao: 'Ênfase com itálico.',
  prompt: `Use <em> para ênfase em itálico dentro de um parágrafo.`,
  previewTipo: 'html',
  previewHtml: `<p class="text-sm text-slate-700">Uma frase com <em class="italic text-slate-900">ênfase em itálico</em>.</p>`,
},
      {
        id: 'p_blockquote',
        nome: '<blockquote> (Citação)',
        descricao: 'Bloco de citação.',
        prompt: `Crie um <blockquote> com barra lateral, texto em itálico e autor abaixo.`,
        previewTipo: 'html',
        previewHtml: `<blockquote class="border-l-4 border-indigo-600 pl-3 text-sm text-slate-700 italic">
  “Um bom layout é tão pouco quanto possível, mas não menos.”
  <div class="mt-2 not-italic text-xs text-slate-500">— Autor</div>
</blockquote>`,
      },
      {
        id: 'p_pre_code',
        nome: '<pre><code> (Código)',
        descricao: 'Bloco de código pré-formatado.',
        prompt: `Crie um bloco de código com <pre><code> em fundo escuro, fonte monoespaçada e scroll horizontal.`,
        previewTipo: 'html',
        previewHtml: `<pre class="bg-slate-900 text-slate-100 text-xs rounded-lg p-3 overflow-auto"><code>npm install
npm run dev</code></pre>`,
      },
{
  id: 'p_hr',
  nome: '<hr> (Linha)',
  descricao: 'Separador horizontal.',
  prompt: `Insira um <hr> sutil para separar seções.`,
  previewTipo: 'html',
  previewHtml: `<div class="w-full"><hr class="border-slate-200" /></div>`,
},
      {
        id: 'p_ul',
        nome: '<ul><li> (Lista)',
        descricao: 'Lista não ordenada.',
        prompt: `Crie uma lista <ul> com bullets e espaçamento entre itens.`,
        previewTipo: 'html',
        previewHtml: `<ul class="list-disc pl-5 text-sm text-slate-700 space-y-1">
  <li>Item 1</li><li>Item 2</li><li>Item 3</li>
</ul>`,
      },
      {
        id: 'p_ol',
        nome: '<ol><li> (Lista ordenada)',
        descricao: 'Lista numerada.',
        prompt: `Crie uma lista <ol> numerada com espaçamento e estilo claro.`,
        previewTipo: 'html',
        previewHtml: `<ol class="list-decimal pl-5 text-sm text-slate-700 space-y-1">
  <li>Passo 1</li><li>Passo 2</li><li>Passo 3</li>
</ol>`,
      },
      {
        id: 'p_dl',
        nome: '<dl><dt><dd> (Definições)',
        descricao: 'Lista de termos e descrições.',
        prompt: `Crie uma lista de definição <dl> com dt em negrito e dd em cor secundária.`,
        previewTipo: 'html',
        previewHtml: `<dl class="text-sm">
  <dt class="font-bold text-slate-900">Termo</dt>
  <dd class="text-slate-600 mb-2">Descrição do termo.</dd>
</dl>`,
      },
      {
        id: 'p_a',
        nome: '<a> (Link)',
        descricao: 'Link com atributos úteis.',
        prompt: `Crie links <a> com estado hover, e exemplos de target, rel e download.`,
        previewTipo: 'html',
        previewHtml: `<div class="text-sm flex gap-4">
  <a class="text-indigo-600 hover:underline" href="https://example.com" target="_blank" rel="noreferrer">Abrir</a>
  <a class="text-indigo-600 hover:underline" href="/arquivo.pdf" download>Download</a>
</div>`,
      },
{
  id: 'p_img',
  nome: '<img> (Imagem)',
  descricao: 'Imagem responsiva com alt.',
  prompt: `Crie uma imagem <img> responsiva com alt obrigatório e cantos arredondados.`,
  previewTipo: 'html',
  previewHtml: `<img class="w-40 h-24 object-cover rounded-lg border border-slate-200" src="https://picsum.photos/200/120" alt="Exemplo" />`,
},
      {
        id: 'p_figure',
        nome: '<figure><figcaption>',
        descricao: 'Figura com legenda.',
        prompt: `Crie um <figure> com imagem e <figcaption> abaixo em texto menor.`,
        previewTipo: 'html',
        previewHtml: `<figure class="w-44">
  <img class="w-full h-24 object-cover rounded-lg border border-slate-200" src="https://picsum.photos/220/120" alt="Figura" />
  <figcaption class="text-xs text-slate-500 mt-1">Legenda da imagem</figcaption>
</figure>`,
      },
      {
        id: 'p_iframe',
        nome: '<iframe> (Embed)',
        descricao: 'Embed de mapa/vídeo.',
        prompt: `Crie um <iframe> responsivo (container com aspect-ratio).`,
        previewTipo: 'html',
        previewHtml: `<div class="w-48 aspect-video border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center text-xs text-slate-500">
  iframe (exemplo)
</div>`,
      },
      {
        id: 'p_form',
        nome: '<form> (Formulário)',
        descricao: 'Estrutura base de formulário.',
        prompt: `Crie um <form> com label + input, textarea e botão submit, com validação visual no focus.`,
        previewTipo: 'html',
        previewHtml: `<form class="space-y-2 bg-white border border-slate-200 rounded-lg p-3 w-56">
  <label class="text-xs font-bold text-slate-700">Email</label>
  <input class="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="voce@email.com" />
  <label class="text-xs font-bold text-slate-700">Mensagem</label>
  <textarea class="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500" rows="3"></textarea>
  <button class="w-full bg-indigo-600 text-white text-xs font-extrabold py-2 rounded-lg">Enviar</button>
</form>`,
      },
      {
        id: 'p_table',
        nome: '<table> (Tabela)',
        descricao: 'Tabela semântica com thead/tbody.',
        prompt: `Crie uma tabela com <thead><tbody>, header destacado e linhas zebra.`,
        previewTipo: 'html',
        previewHtml: `<table class="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
  <thead class="bg-slate-50">
    <tr><th class="text-left p-2">Nome</th><th class="text-left p-2">Status</th></tr>
  </thead>
  <tbody>
    <tr class="border-t"><td class="p-2">Ana</td><td class="p-2">Ativo</td></tr>
    <tr class="border-t bg-slate-50"><td class="p-2">Bruno</td><td class="p-2">Inativo</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'p_details',
        nome: '<details><summary>',
        descricao: 'Acordeão nativo HTML.',
        prompt: `Crie um acordeão usando <details><summary>, com estilo e ícone de abrir/fechar.`,
        previewTipo: 'html',
        previewHtml: `<details class="w-56 bg-white border border-slate-200 rounded-lg p-2">
  <summary class="cursor-pointer text-sm font-bold text-slate-800">Pergunta</summary>
  <div class="text-xs text-slate-600 mt-2">Resposta do acordeão nativo.</div>
</details>`,
      },
      {
        id: 'p_svg',
        nome: '<svg> (Vetor)',
        descricao: 'Icone vetorial inline.',
        prompt: `Crie um SVG inline simples (ex: círculo + check) com tamanho controlado.`,
        previewTipo: 'html',
        previewHtml: `<svg width="36" height="36" viewBox="0 0 24 24" class="text-emerald-600">
  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
  <path d="M7 12l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"></path>
</svg>`,
      },
]

export const catalogoReact: ItemCatalogo[] = [
  {
    id: 'r_button',
    nome: 'Button (props + variantes)',
    descricao: 'variant/size/loading',
    prompt:
      'Crie um componente Button em React + TypeScript com props variant (primary/secondary/danger/ghost), size (sm/md/lg), isLoading, disabled e onClick. Inclua forwardRef e classes Tailwind.',
    previewTipo: 'blocos',
    previewBlocos: [
      { tipo: 'botao', label: 'Primary', destaque: true },
      { tipo: 'botao', label: 'Secondary' },
      { tipo: 'botao', label: 'Loading…' },
    ],
  },
  {
    id: 'r_modal',
    nome: 'Modal (Portal + ESC)',
    descricao: 'Portal, focus trap, overlay click.',
    prompt:
      'Crie um Modal controlado em React com portal, focus trap, tecla ESC para fechar, click no overlay fecha, e animação leve. Props: isOpen, onClose, title, children.',
    previewTipo: 'blocos',
    previewBlocos: [{ tipo: 'barra', label: 'Modal', destaque: true }, { tipo: 'texto', label: 'Conteúdo...' }, { tipo: 'botao', label: 'Fechar' }],
  },
  {
    id: 'r_table',
    nome: 'DataTable (sorting + filtros)',
    descricao: 'useMemo para performance',
    prompt:
      'Crie uma DataTable em React com sorting por coluna e filtros. Use useMemo para derivar a lista filtrada/ordenada. Inclua paginação e estado vazio.',
    previewTipo: 'blocos',
    previewBlocos: [{ tipo: 'linha', label: 'Cabeçalho' }, { tipo: 'linha', label: 'Linha 1' }, { tipo: 'linha', label: 'Linha 2' }],
  },
]

const extrasReactNomes = [
  'Toast Provider', 'useLocalStorage hook', 'Debounced Search', 'Pagination', 'Accordion',
  'Tabs Acessíveis', 'Drawer (mobile)', 'Stepper / Wizard', 'Error Boundary', 'Infinite Scroll',
  'Command Palette (Ctrl+K)', 'Kanban Board', 'MultiSelect', 'File Upload (preview)', 'Theme Toggle',
  'Auth Guard', 'API Client', 'Zustand store', 'React Query setup', 'Charts (Recharts)',
  'Drag & Drop lista', 'Virtualized List', 'Skeleton component', 'Modal confirm dialog',
]

extrasReactNomes.forEach((nome, idx) => {
  catalogoReact.push({
    id: `r_extra_${idx}`,
    nome,
    descricao: 'Componente React pronto + prompt detalhado.',
    prompt:
      `Crie o componente "${nome}" em React + TypeScript. Use boas práticas (acessibilidade, estados loading/erro), e exemplos reais de uso. Organize em arquivos e exporte APIs limpas.`,
    previewTipo: 'blocos',
    previewBlocos: [
      { tipo: 'barra', label: nome, destaque: true },
      { tipo: 'texto', label: 'Exemplo' },
      { tipo: 'badge', label: 'OK' },
      { tipo: 'botao', label: 'Ação' },
    ],
  })
})
// === DATASETS CATÁLOGO | fim ===
