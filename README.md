# Page Architect v_A01

## Visão geral
Projeto React + Vite para montar layouts visuais, gerar prompt mestre a partir do canvas e visualizar o resultado em tela separada.

## Stack
- React
- Vite
- TypeScript
- Tailwind CSS
- Zustand
- Lucide React

## Estrutura
- `src/features/builder` -> editor principal, estado global, canvas e painéis.
- `src/pages` -> páginas principais do app e monitor.
- `src/types` -> tipos centrais do builder.
- `src/utils` -> utilitários, incluindo paleta Tailwind.
- `config/servidor_dev.env` -> host e porta do ambiente local.
- `bats/` -> atalhos para instalação, dev e build.
- `doc/` -> documentação, changelog e validação.

## Instalação
```bash
cd page_architect_v_a04
npm install
```

## Comandos
```bash
npm run dev
npm run build
npm run preview
```

## Como rodar
```bash
cd page_architect_v_a04
npm install
npm run dev
```

Localhost final do projeto:
```text
http://localhost:5198/
```

## Ambiente
Arquivo de ambiente local:
- `config/servidor_dev.env`

Conteúdo atual:
```env
HOST=localhost
PORTA=5198
```

## Banco
Este projeto não usa banco de dados nesta versão.

## Deploy
Deploy web padrão via build do Vite.

## Fluxo do sistema
01 - o usuário arrasta peças para o canvas.
02 - o estado do builder é salvo e sincronizado localmente.
03 - o monitor lê snapshots e espelha o layout.
04 - o modal de prompt mestre transforma o canvas em instrução textual.

## Prints
Nesta entrega não foram incluídos prints.

## Próximos passos sugeridos
01 - revisar UX do menu de contexto e atalhos.
02 - expandir a biblioteca de componentes HTML.
03 - evoluir feedback visual de salvar/carregar slots.

## Observações desta entrega
01 - o erro crítico de JSX no `Canvas.tsx` foi corrigido.
02 - o projeto foi validado com `npm install`, `npm run dev` e `npm run build`.
03 - o `.npmrc` foi mantido sem cache local por projeto, sem trocar prefix e sem trocar registry.
04 - o `bats/01_rodar_dev.bat` foi corrigido para ler `config/servidor_dev.env` no caminho certo.


## Observações de instalação

- O projeto usa npm em comportamento padrão, sem cache local dentro da pasta do projeto.
- O `package-lock.json` desta versão foi sanitizado para usar o registry público do npm.
- Não é necessário apagar o `package-lock.json` para instalar.
