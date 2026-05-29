# Validação final - page_architect_v_a04

## Checklist
- [x] npm install
- [x] npm run dev
- [x] npm run build
- [x] leitura do `config/servidor_dev.env`
- [x] revisão dos arquivos `.bat`
- [x] correção do `package-lock.json`
- [x] revisão do `.npmrc`

## Resultado
01 - o `Canvas.tsx` foi corrigido, incluindo o `inputImportarRef` dentro do componente `Canvas`.
02 - o erro `Invalid hook call` e a falha `Cannot read properties of null (reading 'useRef')` deixaram de ocorrer pela estrutura corrigida do arquivo.
03 - `package.json` e `package-lock.json` foram alinhados.
04 - o `package-lock.json` foi sanitizado para usar somente o registry público do npm, sem URLs internas/privadas no campo `resolved`.
05 - a porta local foi ajustada para `5198`.
06 - os scripts `.bat` passaram a usar `--strictPort`.
07 - o `bats/01_rodar_dev.bat` passou a apontar para `..\config\servidor_dev.env`.
08 - o `.npmrc` foi mantido em modo padrão, sem cache local dentro do projeto e sem sobrescrever registry/prefix/cache.

## Observação
Validação executada no ambiente do assistente. No Windows do usuário ainda podem existir diferenças locais de Node, npm, PATH, permissão ou antivírus.


## Validação v_a03
- [x] npm install
- [x] npm run dev
- [x] npm run build
- [x] leitura do config/servidor_dev.env
- [x] painel do builder abre sem erro


## Validação v_a04

01 - `npm install` executado com sucesso.
02 - `npm run build` executado com sucesso.
03 - `npm run dev -- --host localhost --port 5198 --strictPort` encontrou a porta ocupada no ambiente de validação.
04 - `npm run dev -- --host localhost --port 5199 --strictPort` executado com sucesso para validação do boot do Vite.
05 - configuração entregue no projeto permanece em `localhost:5198`.
