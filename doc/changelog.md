## v_a04 - etiquetas do canvas e z-index padrão

01 - classe (`className/class`) não aparece mais como etiqueta no Canvas; continua entrando no prompt.
02 - descrição do elemento no Canvas agora quebra linha e aparece completa, sem `ellipsis`.
03 - elementos passaram a renderizar com `z-index: 0` por padrão quando não houver valor customizado.
04 - migração do estado persistido agora normaliza `zIndex` ausente para `0`.
05 - campo de descrição no Inspector virou `textarea` para facilitar textos maiores.
06 - porta local configurada para `localhost:5198`.

## v8.4.0
- Monitor (2ª tela) em tempo real via BroadcastChannel e sem bordas
- Prompt mestre com modos (completo / sem estilos / somente posição)
- Campo "Descrição" no Inspector (só Canvas) e label do div sem "tag_div"/CONTAINER
- Busca no painel "Peças" + remoção de duplicados (Navbar/Footer templates)
- Porta sincronizada em 5182 (vite + servidor_dev.env)


## v8.9.3
- Monitor (/viewpage) sincronizando por localStorage + postMessage (referência v8.3)

## v8.9.4
- Monitor: leitura do snapshot realtime (localStorage keys page_architect_realtime_snapshot_v2/pulse_v2) + BroadcastChannel + postMessage.

## v8.9.5
- Monitor: render independente de Tailwind (inline 100vw/100vh) para evitar canvas 0px; mantém realtime snapshot.

## v8.9.6
- Monitor espelha o estilo do Canvas (bordas/cores/radius/sombra) sem UI do editor.


## v8.9.7
- AppShell: header simplificado (logo alterna abas) + Monitor apenas ícone.
- Inspector: travas reposicionadas (mover/resize/proporção), Árvore + breadcrumb, camadas com subir/descer, estilo avançado (padding/radius/borda/opacidade/sombra/blur).
- Paleta Tailwind: todas as cores (botões 500) + lista de tonalidades com HEX, abas bg/text/border.
- Canvas: magnetismo também alinha centros; duplo-clique na borda expande até borda/elemento mais próximo; prompt inclui elemento raiz (body/div#root).
- Monitor: espelho de estilo com padding/opacity/borda/radius/sombra/blur; debug por tecla 'D' (opcional).


## v8.9.8
- Fix: ViewPage (Monitor) com JSX válido (corrige erro do Babel em ViewPage.tsx). (Erro reportado em ViewPage.tsx linha ~361) 
- Undo/Redo: histórico (Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z) + botões na Topbar.
- Histórico não persiste no localStorage (somente estado do layout).


## v8.9.9
- Fix crítico: estadoBuilder.ts (Undo/Redo) agora compila; helper aplicarComHistorico movido para fora do objeto (sintaxe válida).

## v_A01
- Fix crítico no `Canvas.tsx`, corrigindo a estrutura JSX que impedia `npm run dev`.
- Ajustes complementares de TypeScript em `Canvas.tsx`, `estadoBuilder.ts`, `ViewPage.tsx`, `PainelPecas.tsx`, `PaletaTailwind.tsx` e `tiposBuilder.ts`.
- `package.json` + `package-lock.json` alinhados para evitar a necessidade de apagar o lockfile.
- Porta local atualizada para `5198` e scripts `.bat` sincronizados com `--strictPort`.
- Ajuste do `.npmrc` para remover cache local por projeto e manter o npm em modo padrão.
- Correção do `bats/01_rodar_dev.bat` para ler `config/servidor_dev.env` a partir da pasta `bats`.
- Limpeza dos scripts de dependências para não alterar cache, prefix ou registry do npm.


## v_A02
- Fix crítico: `Canvas.tsx` com `inputImportarRef` movido para dentro do componente `Canvas`, corrigindo `Invalid hook call` e `Cannot read properties of null (reading 'useRef')`.
- `package-lock.json` sanitizado para usar o registry público do npm, removendo URLs `resolved` de host interno/privado.
- `.npmrc` mantido em modo padrão, sem cache local dentro do projeto e sem sobrescrever registry/prefix/cache.
- Porta local atualizada para `5198` com scripts `.bat` sincronizados.


## v_a03 - ajustes de padrão do builder
- removido bloco Árvore do Inspector
- removido bloco Margin do Inspector
- novos elementos passam a nascer com z-index-0
- novos elementos passam a nascer sem borda, texto e fundo atribuídos
- tamanho padrão de novos elementos ajustado para W=5 e H=5
- categorias Formulários, Tabelas, Modernos, Especiais e Elementos removidas do painel e itens recategorizados
- porta local atualizada para localhost:5198
