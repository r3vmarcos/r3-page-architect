import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LayoutGrid,
  PanelBottom,
  PanelLeft,
  PanelTop,
  Image,
  Square,
  Minus,
  Type,
  RectangleHorizontal,
  FormInput,
  Star,
  PlaySquare,
  GalleryHorizontal,
  Layers,
  CreditCard,
  HelpCircle,
  List,
  Table2,
  Columns3,
  Brackets,
  Quote,
  Code2,
  Link as LinkIcon,
  FileDigit,
  Heading,
  TextCursorInput,
} from "lucide-react";
import type { TipoElemento } from "@/types/tiposBuilder";
import { useEstadoBuilder } from "@/features/builder/estadoBuilder";
import { ArvoreElementos } from "./ArvoreElementos";

// === DADOS PEÇAS | inicio ===
type CategoriaPeca =
  | "Estruturas"
  | "Componentes"
  | "Semânticos"
  | "Textos"
  | "Listas"
  | "Links"
  | "Mídia";
type ItemPeca = {
  tipo: TipoElemento;
  nome: string;
  icone: React.ReactNode;
  categoria: CategoriaPeca;
};
const ordenadorPecas =
  new Intl.Collator("pt-BR", {
    sensitivity: "base",
  });

const itensPecas: ItemPeca[] = [
  // Estruturas do app
  {
    tipo: "hero",
    nome: "Hero",
    icone: (
      <Image className="w-4 h-4" />
    ),
    categoria: "Estruturas",
  },
  {
    tipo: "secao",
    nome: "Seção",
    icone: (
      <LayoutGrid className="w-4 h-4" />
    ),
    categoria: "Estruturas",
  },
  {
    tipo: "grid",
    nome: "Grid",
    icone: (
      <LayoutGrid className="w-4 h-4" />
    ),
    categoria: "Estruturas",
  },
  {
    tipo: "card",
    nome: "Card",
    icone: (
      <Square className="w-4 h-4" />
    ),
    categoria: "Estruturas",
  },
  {
    tipo: "sidebar",
    nome: "Sidebar",
    icone: (
      <PanelLeft className="w-4 h-4" />
    ),
    categoria: "Estruturas",
  },
  {
    tipo: "galeria",
    nome: "Galeria",
    icone: (
      <GalleryHorizontal className="w-4 h-4" />
    ),
    categoria: "Estruturas",
  },

  // Componentes de layout (app)
  {
    tipo: "tabs",
    nome: "Tabs",
    icone: (
      <Columns3 className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "modal",
    nome: "Modal",
    icone: (
      <Layers className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "drawer",
    nome: "Drawer",
    icone: (
      <PanelLeft className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "pricing",
    nome: "Pricing",
    icone: (
      <CreditCard className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "faq",
    nome: "FAQ",
    icone: (
      <HelpCircle className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "lista",
    nome: "Lista",
    icone: <List className="w-4 h-4" />,
    categoria: "Componentes",
  },
  {
    tipo: "tabela",
    nome: "Tabela",
    icone: (
      <Table2 className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },

  // === HTML5 Semânticos ===
  {
    tipo: "tag_header",
    nome: "<header>",
    icone: (
      <PanelTop className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_nav",
    nome: "<nav>",
    icone: (
      <LinkIcon className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_main",
    nome: "<main>",
    icone: (
      <LayoutGrid className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_section",
    nome: "<section>",
    icone: (
      <LayoutGrid className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_article",
    nome: "<article>",
    icone: (
      <FileDigit className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_aside",
    nome: "<aside>",
    icone: (
      <PanelLeft className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_footer",
    nome: "<footer>",
    icone: (
      <PanelBottom className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_div",
    nome: "<div>",
    icone: (
      <Brackets className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },

  // Textos
  {
    tipo: "tag_h1",
    nome: "<h1>",
    icone: (
      <Heading className="w-4 h-4" />
    ),
    categoria: "Textos",
  },
  {
    tipo: "tag_h2",
    nome: "<h2>",
    icone: (
      <Heading className="w-4 h-4" />
    ),
    categoria: "Textos",
  },
  {
    tipo: "tag_h3",
    nome: "<h3>",
    icone: (
      <Heading className="w-4 h-4" />
    ),
    categoria: "Textos",
  },
  {
    tipo: "tag_h4",
    nome: "<h4>",
    icone: (
      <Heading className="w-4 h-4" />
    ),
    categoria: "Textos",
  },
  {
    tipo: "tag_h5",
    nome: "<h5>",
    icone: (
      <Heading className="w-4 h-4" />
    ),
    categoria: "Textos",
  },
  {
    tipo: "tag_h6",
    nome: "<h6>",
    icone: (
      <Heading className="w-4 h-4" />
    ),
    categoria: "Textos",
  },
  {
    tipo: "tag_p",
    nome: "<p>",
    icone: <Type className="w-4 h-4" />,
    categoria: "Textos",
  },
  {
    tipo: "tag_span",
    nome: "<span>",
    icone: <Type className="w-4 h-4" />,
    categoria: "Textos",
  },
  {
    tipo: "tag_strong",
    nome: "<strong>",
    icone: <Type className="w-4 h-4" />,
    categoria: "Textos",
  },
  {
    tipo: "tag_em",
    nome: "<em>",
    icone: <Type className="w-4 h-4" />,
    categoria: "Textos",
  },
  {
    tipo: "tag_blockquote",
    nome: "<blockquote>",
    icone: (
      <Quote className="w-4 h-4" />
    ),
    categoria: "Textos",
  },
  {
    tipo: "tag_pre",
    nome: "<pre>",
    icone: (
      <Code2 className="w-4 h-4" />
    ),
    categoria: "Textos",
  },
  {
    tipo: "tag_code",
    nome: "<code>",
    icone: (
      <Code2 className="w-4 h-4" />
    ),
    categoria: "Textos",
  },
  {
    tipo: "tag_br",
    nome: "<br>",
    icone: (
      <Minus className="w-4 h-4" />
    ),
    categoria: "Textos",
  },
  {
    tipo: "tag_hr",
    nome: "<hr>",
    icone: (
      <Minus className="w-4 h-4" />
    ),
    categoria: "Textos",
  },

  // Listas
  {
    tipo: "tag_ul",
    nome: "<ul>",
    icone: <List className="w-4 h-4" />,
    categoria: "Listas",
  },
  {
    tipo: "tag_ol",
    nome: "<ol>",
    icone: <List className="w-4 h-4" />,
    categoria: "Listas",
  },
  {
    tipo: "tag_li",
    nome: "<li>",
    icone: <List className="w-4 h-4" />,
    categoria: "Listas",
  },
  {
    tipo: "tag_dl",
    nome: "<dl>",
    icone: <List className="w-4 h-4" />,
    categoria: "Listas",
  },
  {
    tipo: "tag_dt",
    nome: "<dt>",
    icone: <List className="w-4 h-4" />,
    categoria: "Listas",
  },
  {
    tipo: "tag_dd",
    nome: "<dd>",
    icone: <List className="w-4 h-4" />,
    categoria: "Listas",
  },

  // Links
  {
    tipo: "tag_a",
    nome: "<a>",
    icone: (
      <LinkIcon className="w-4 h-4" />
    ),
    categoria: "Links",
  },

  // Mídia
  {
    tipo: "tag_img",
    nome: "<img>",
    icone: (
      <Image className="w-4 h-4" />
    ),
    categoria: "Mídia",
  },
  {
    tipo: "tag_picture",
    nome: "<picture>",
    icone: (
      <Image className="w-4 h-4" />
    ),
    categoria: "Mídia",
  },
  {
    tipo: "tag_source",
    nome: "<source>",
    icone: (
      <Image className="w-4 h-4" />
    ),
    categoria: "Mídia",
  },
  {
    tipo: "tag_figure",
    nome: "<figure>",
    icone: (
      <Image className="w-4 h-4" />
    ),
    categoria: "Mídia",
  },
  {
    tipo: "tag_figcaption",
    nome: "<figcaption>",
    icone: <Type className="w-4 h-4" />,
    categoria: "Mídia",
  },
  {
    tipo: "tag_audio",
    nome: "<audio>",
    icone: (
      <PlaySquare className="w-4 h-4" />
    ),
    categoria: "Mídia",
  },
  {
    tipo: "tag_iframe",
    nome: "<iframe>",
    icone: (
      <LayoutGrid className="w-4 h-4" />
    ),
    categoria: "Mídia",
  },

  // Formulários
  {
    tipo: "tag_form",
    nome: "<form>",
    icone: (
      <FormInput className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "tag_label",
    nome: "<label>",
    icone: <Type className="w-4 h-4" />,
    categoria: "Componentes",
  },
  {
    tipo: "tag_button",
    nome: "<button>",
    icone: (
      <RectangleHorizontal className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "tag_fieldset",
    nome: "<fieldset>",
    icone: (
      <LayoutGrid className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "tag_legend",
    nome: "<legend>",
    icone: <Type className="w-4 h-4" />,
    categoria: "Componentes",
  },
  {
    tipo: "tag_datalist",
    nome: "<datalist>",
    icone: (
      <TextCursorInput className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "tag_option",
    nome: "<option>",
    icone: (
      <TextCursorInput className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "tag_optgroup",
    nome: "<optgroup>",
    icone: (
      <TextCursorInput className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "tag_meter",
    nome: "<meter>",
    icone: <Star className="w-4 h-4" />,
    categoria: "Componentes",
  },

  // Tabelas
  {
    tipo: "tag_table",
    nome: "<table>",
    icone: (
      <Table2 className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_thead",
    nome: "<thead>",
    icone: (
      <Table2 className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_tbody",
    nome: "<tbody>",
    icone: (
      <Table2 className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_tfoot",
    nome: "<tfoot>",
    icone: (
      <Table2 className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_tr",
    nome: "<tr>",
    icone: (
      <Table2 className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_th",
    nome: "<th>",
    icone: (
      <Table2 className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_td",
    nome: "<td>",
    icone: (
      <Table2 className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_caption",
    nome: "<caption>",
    icone: <Type className="w-4 h-4" />,
    categoria: "Semânticos",
  },

  // Modernos
  {
    tipo: "tag_details",
    nome: "<details>",
    icone: (
      <HelpCircle className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_summary",
    nome: "<summary>",
    icone: (
      <HelpCircle className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_dialog",
    nome: "<dialog>",
    icone: (
      <Layers className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_mark",
    nome: "<mark>",
    icone: <Star className="w-4 h-4" />,
    categoria: "Semânticos",
  },
  {
    tipo: "tag_time",
    nome: "<time>",
    icone: <Star className="w-4 h-4" />,
    categoria: "Semânticos",
  },
  {
    tipo: "tag_address",
    nome: "<address>",
    icone: <Type className="w-4 h-4" />,
    categoria: "Semânticos",
  },
  {
    tipo: "tag_abbr",
    nome: "<abbr>",
    icone: <Type className="w-4 h-4" />,
    categoria: "Semânticos",
  },
  {
    tipo: "tag_cite",
    nome: "<cite>",
    icone: (
      <Quote className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },

  // Especiais
  {
    tipo: "tag_canvas",
    nome: "<canvas>",
    icone: (
      <LayoutGrid className="w-4 h-4" />
    ),
    categoria: "Mídia",
  },
  {
    tipo: "tag_svg",
    nome: "<svg>",
    icone: <Star className="w-4 h-4" />,
    categoria: "Mídia",
  },
  {
    tipo: "tag_template",
    nome: "<template>",
    icone: (
      <Brackets className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },
  {
    tipo: "tag_slot",
    nome: "<slot>",
    icone: (
      <Brackets className="w-4 h-4" />
    ),
    categoria: "Semânticos",
  },

  // Elementos (genéricos do app)
  {
    tipo: "botao",
    nome: "Botão",
    icone: (
      <RectangleHorizontal className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "titulo",
    nome: "Título",
    icone: <Type className="w-4 h-4" />,
    categoria: "Componentes",
  },
  {
    tipo: "texto",
    nome: "Texto",
    icone: <Type className="w-4 h-4" />,
    categoria: "Componentes",
  },
  {
    tipo: "imagem",
    nome: "Imagem",
    icone: (
      <Image className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "video",
    nome: "Vídeo",
    icone: (
      <PlaySquare className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "input",
    nome: "Input",
    icone: (
      <FormInput className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
  {
    tipo: "icone",
    nome: "Ícone",
    icone: <Star className="w-4 h-4" />,
    categoria: "Componentes",
  },
  {
    tipo: "divisor",
    nome: "Divisor",
    icone: (
      <Minus className="w-4 h-4" />
    ),
    categoria: "Componentes",
  },
];
// === DADOS PEÇAS | fim ===

// === PAINEL PEÇAS | inicio ===
function explicarPeca(item: ItemPeca) {
  const explicacoes: Partial<
    Record<TipoElemento, string>
  > = {
    hero: "Bloco de abertura para apresentar a principal mensagem da pagina, normalmente com titulo, apoio visual e chamada para acao.",
    secao:
      "Area horizontal para agrupar conteudos relacionados e organizar a pagina em partes claras.",
    grid: "Estrutura para distribuir itens em colunas e linhas com alinhamento consistente.",
    card: "Container compacto para destacar um conteudo individual, como recurso, produto, pessoa ou resumo.",
    sidebar:
      "Painel lateral para navegacao, filtros, atalhos ou informacoes secundarias.",
    galeria:
      "Agrupamento visual para imagens, midias ou exemplos em sequencia.",
    tabs: "Componente para alternar entre conteudos no mesmo espaco sem trocar de pagina.",
    modal:
      "Janela sobreposta para foco temporario, confirmacoes, formularios ou detalhes.",
    drawer:
      "Painel deslizante lateral para menus, filtros e acoes contextuais.",
    pricing:
      "Componente para comparar planos, beneficios e precos.",
    faq: "Area de perguntas frequentes para explicar duvidas comuns de forma escaneavel.",
    lista:
      "Componente de lista pronto para conjuntos de itens, beneficios, passos ou registros.",
    tabela:
      "Componente para dados tabulares com linhas e colunas.",
    botao:
      "Acao clicavel principal ou secundaria dentro da interface.",
    titulo:
      "Texto de destaque para criar hierarquia e nomear secoes.",
    texto:
      "Bloco de conteudo textual para descricoes, instrucoes ou corpo da pagina.",
    imagem:
      "Elemento visual para fotos, ilustracoes, previews ou marcas.",
    video:
      "Midia em video para demonstracoes, apresentacoes ou conteudo incorporado.",
    input:
      "Campo de entrada para o usuario preencher informacoes.",
    icone:
      "Sinal visual pequeno para representar uma acao, status ou ideia.",
    divisor:
      "Linha ou separador para dividir grupos de conteudo.",
  };

  if (explicacoes[item.tipo])
    return explicacoes[item.tipo];
  if (item.tipo.startsWith("tag_")) {
    const tag = item.nome.replace(
      /[<>]/g,
      "",
    );
    return `Elemento HTML <${tag}>. Use quando quiser manter a semantica nativa da pagina e controlar este tipo diretamente no layout.`;
  }
  return `Item ${item.nome} da categoria ${item.categoria}. O tipo interno permanece como "${item.tipo}" para o builder.`;
}

export function PainelPecas() {
  const {
    adicionarElemento,
    selecionarElemento,
  } = useEstadoBuilder();
  const [buscaPecas, setBuscaPecas] =
    useState("");
  const [pecaEmFoco, setPecaEmFoco] =
    useState<ItemPeca | null>(null);
  const [infoAtiva, setInfoAtiva] =
    useState(true);
  const [alturaArvorePx, setAlturaArvorePx] =
    useState(180);
  const resizeArvoreRef = useRef<{
    startY: number;
    startH: number;
  } | null>(null);

  const itensFiltrados = useMemo(() => {
    const termo = buscaPecas
      .trim()
      .toLowerCase();
    const base = itensPecas.filter(
      (i) =>
        termo
          ? `${i.nome} ${i.tipo} ${i.categoria}`
              .toLowerCase()
              .includes(termo)
          : true,
    );

    // garantir que não existem tipos repetidos
    const mapa = new Map<
      TipoElemento,
      ItemPeca
    >();
    base.forEach((i) => {
      if (!mapa.has(i.tipo))
        mapa.set(i.tipo, i);
    });

    return Array.from(
      mapa.values(),
    ).sort((a, b) =>
      ordenadorPecas.compare(
        a.nome,
        b.nome,
      ),
    );
  }, [buscaPecas]);

  function aoArrastarComecar(
    e: React.DragEvent,
    tipo: TipoElemento,
  ) {
    e.dataTransfer.setData(
      "text/plain",
      tipo,
    );
    e.dataTransfer.effectAllowed =
      "copy";
  }

  useEffect(() => {
    function onMove(ev: PointerEvent) {
      const ctx = resizeArvoreRef.current;
      if (!ctx) return;
      const delta = ctx.startY - ev.clientY;
      setAlturaArvorePx(
        Math.max(
          110,
          Math.min(420, ctx.startH + delta),
        ),
      );
    }

    function onUp() {
      resizeArvoreRef.current = null;
    }

    window.addEventListener(
      "pointermove",
      onMove,
    );
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener(
        "pointermove",
        onMove,
      );
      window.removeEventListener(
        "pointerup",
        onUp,
      );
    };
  }, []);

  return (
    <div className="relative h-full min-h-0 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-lg items-center font-extrabold text-white uppercase">
            Elementos
          </div>
          <button
            onClick={() =>
              setInfoAtiva((ativo) => !ativo)
            }
            className={
              "w-7 h-7 rounded-lg border text-xs font-extrabold flex items-center justify-center " +
              (infoAtiva
                ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-200"
                : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600")
            }
            title={
              infoAtiva
                ? "Desativar informações"
                : "Ativar informações"
            }
          >
            i
          </button>
        </div>
        <div className="text-[10px] text-slate-400">
          {itensFiltrados.length} itens
        </div>
      </div>

      <div className="mb-3">
        <input
          value={buscaPecas}
          onChange={(e) =>
            setBuscaPecas(
              e.target.value,
            )
          }
          placeholder="Buscar peças... (ex: footer, h1, form, video)"
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs outline-none focus:border-indigo-500"
        />
      </div>

      {infoAtiva && pecaEmFoco ? (
        <div className="pointer-events-none absolute left-3 right-3 top-[92px] z-20 rounded-xl border border-indigo-500/40 bg-slate-950/95 p-3 shadow-2xl shadow-slate-950/60">
          <div className="flex items-center gap-2 text-xs font-extrabold text-white">
            <span className="text-indigo-300">
              {pecaEmFoco.icone}
            </span>
            <span className="truncate">
              {pecaEmFoco.nome}
            </span>
          </div>
          <div className="mt-2 text-[11px] leading-relaxed text-slate-300">
            {explicarPeca(pecaEmFoco)}
          </div>
        </div>
      ) : null}

      <div className="flex-1 min-h-0 overflow-auto pr-1">
        <div className="grid grid-cols-2 gap-2">
          {itensFiltrados.map((i) => (
            <div
              key={i.tipo}
              draggable
              onDragStart={(e) =>
                aoArrastarComecar(
                  e,
                  i.tipo,
                )
              }
              onMouseEnter={() =>
                setPecaEmFoco(i)
              }
              onMouseLeave={() =>
                setPecaEmFoco(null)
              }
              onFocus={() =>
                setPecaEmFoco(i)
              }
              onBlur={() =>
                setPecaEmFoco(null)
              }
              className="cursor-grab active:cursor-grabbing select-none rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 focus:border-indigo-500 focus:outline-none p-2 text-xs font-bold text-slate-100 flex items-center gap-2"
              title="Arraste para o canvas"
              tabIndex={0}
            >
              <span className="text-indigo-300">
                {i.icone}
              </span>
              <span className="truncate">
                {i.nome}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            adicionarElemento(
              "tag_div",
              null,
              10,
              10,
            );
            selecionarElemento(null);
          }}
          className="w-full mt-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold"
        >
          Adicionar &lt;div&gt; (atalho)
        </button>
      </div>

      <div
        className="my-2 h-3 cursor-row-resize rounded-full bg-slate-950 border border-slate-800 hover:border-indigo-500"
        onPointerDown={(e) => {
          resizeArvoreRef.current = {
            startY: e.clientY,
            startH: alturaArvorePx,
          };
        }}
        title="Arraste para ajustar Elementos / Árvore"
      />

      <div
        className="min-h-0 overflow-hidden"
        style={{ height: alturaArvorePx }}
      >
        <ArvoreElementos compacta />
      </div>
    </div>
  );
}
// === PAINEL PEÇAS | fim ===
