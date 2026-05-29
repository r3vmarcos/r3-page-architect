# Info do Projeto: Arquivos e Funções

Este documento descreve a função de cada arquivo do projeto, organizado por tipo/pasta.

## Páginas
Objetivo: telas/rotas principais que compõem a navegação da aplicação.

- [`src/pages/AppShell.tsx`](../src/pages/AppShell.tsx) -> página shell com navegação/abas e layout 100vh/100vw; usado como layout principal do construtor.
- [`src/pages/ViewPage.tsx`](../src/pages/ViewPage.tsx) -> página de visualização final sem menus (/viewpage); renderiza o layout salvo; usado para preview do site final.

## Componentes
Objetivo: componentes reutilizáveis (UI/estruturas) usados em múltiplas áreas.

- (nenhum)

## Features
Objetivo: funcionalidades organizadas por domínio (feature-based), com UI e lógica associadas.

- [`src/features/builder/BuilderPage.tsx`](../src/features/builder/BuilderPage.tsx) -> feature page do construtor; organiza Painel de Peças, Canvas e Inspector; usado no fluxo principal de montagem.
- [`src/features/builder/componentes/Canvas.tsx`](../src/features/builder/componentes/Canvas.tsx) -> componente do canvas (drag, resize, magnetismo, aninhar e modal do prompt); crítico para manipulação visual.
- [`src/features/builder/componentes/Inspector.tsx`](../src/features/builder/componentes/Inspector.tsx) -> painel de propriedades do elemento selecionado (geometria, cores, z-index); usado no ajuste fino.
- [`src/features/builder/componentes/ModalPromptMestre.tsx`](../src/features/builder/componentes/ModalPromptMestre.tsx) -> modal que exibe o prompt mestre com botão copiar; usado ao exportar instruções para IA.
- [`src/features/builder/componentes/PainelPecas.tsx`](../src/features/builder/componentes/PainelPecas.tsx) -> sidebar de peças arrastáveis; usado para criação rápida de estruturas/elementos.
- [`src/features/builder/componentes/PaletaTailwind.tsx`](../src/features/builder/componentes/PaletaTailwind.tsx) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`src/features/builder/estadoBuilder.ts`](../src/features/builder/estadoBuilder.ts) -> store Zustand com persistência em localStorage; controla elementos, hierarquia, cores e resolução; crítico para salvar/recuperar layout.
- [`src/features/catalog/CatalogoPage.tsx`](../src/features/catalog/CatalogoPage.tsx) -> catálogo (Básico/React) com cards e exemplos; usado como biblioteca de prompts/componentes.
- [`src/features/catalog/datasets.ts`](../src/features/catalog/datasets.ts) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.

## Hooks
Objetivo: hooks customizados reutilizáveis para comportamento compartilhado.

- (nenhum)

## Services
Objetivo: camada de serviços (API, storage, integrações) quando aplicável.

- (nenhum)

## Utils
Objetivo: utilitários puros (helpers) para cálculos e funções comuns.

- [`src/utils/coresTailwind.ts`](../src/utils/coresTailwind.ts) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.

## Types
Objetivo: tipagens TypeScript centralizadas para consistência do domínio.

- [`src/types/tiposBuilder.ts`](../src/types/tiposBuilder.ts) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.

## Assets
Objetivo: imagens/ícones/arquivos estáticos usados no app.

- (nenhum)

## Configurações
Objetivo: arquivos de configuração (Vite, TS, Tailwind, env) e setup do projeto.

- [`config/servidor_dev.env`](../config/servidor_dev.env) -> config do host/porta do servidor dev lido pelos .bat; crítico para rodar dev na LAN.
- [`package.json`](../package.json) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`.npmrc`](../.npmrc) -> configuração do npm para instalação estável sem cache local por projeto, sem alterar prefix e sem alterar registry; crítico para evitar efeitos colaterais no Windows.
- [`postcss.config.cjs`](../postcss.config.cjs) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`tailwind.config.ts`](../tailwind.config.ts) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`tsconfig.json`](../tsconfig.json) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`tsconfig.node.json`](../tsconfig.node.json) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`vite.config.ts`](../vite.config.ts) -> configuração do Vite (ESM) com alias @ e porta dev; crítico para build/dev.

## Scripts BAT
Objetivo: scripts Windows para instalar, rodar dev, build e atalhos.

- [`bats/00_instalar_dependencias.bat`](../bats/00_instalar_dependencias.bat) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`bats/01_rodar_dev.bat`](../bats/01_rodar_dev.bat) -> script BAT que lê `../config/servidor_dev.env` e executa `npm run dev` com `--host`, `--port` e `--strictPort`; crítico para rodar o ambiente local pela pasta `bats`.
- [`bats/02_gerar_build.bat`](../bats/02_gerar_build.bat) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`bats/Cloudflare/Opcoes_Cloudflare.bat`](../bats/Cloudflare/Opcoes_Cloudflare.bat) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`z_bat_vscode.bat`](../z_bat_vscode.bat) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`z_menu.bat`](../z_menu.bat) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`z_npm_install.bat`](../z_npm_install.bat) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.
- [`z_run_dev.bat`](../z_run_dev.bat) -> script BAT da raiz que lê `config/servidor_dev.env` e executa `npm run dev` com `--host`, `--port` e `--strictPort`; crítico para execução rápida do ambiente local.

## Documentação
Objetivo: documentação do projeto (README e docs).

- [`README.md`](../README.md) -> arquivo que compõe o projeto; usado no fluxo do sistema; revisar se for crítico.


- [`src/features/builder/estadoBuilder.ts`](../src/features/builder/estadoBuilder.ts) -> [store] que define os defaults de novos elementos; usado no fluxo de criação, duplicação e histórico; arquivo crítico para tamanho inicial, z-index e estilos padrão.
- [`src/features/builder/componentes/Inspector.tsx`](../src/features/builder/componentes/Inspector.tsx) -> [componente] que edita propriedades do item selecionado; usado no painel lateral direito; nesta versão removeu os blocos Árvore e Margin e padronizou o marcador de camada.
- [`src/features/builder/componentes/PainelPecas.tsx`](../src/features/builder/componentes/PainelPecas.tsx) -> [componente] que lista as peças arrastáveis; usado no painel lateral esquerdo; nesta versão removeu categorias antigas e redistribuiu os itens restantes.
