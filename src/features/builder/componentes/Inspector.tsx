import { useMemo, useState } from "react";
import { Lock, LockOpen, Link2, Link2Off } from "lucide-react";
import { PaletaTailwind } from "./PaletaTailwind";
import type { ElementoBuilder } from "@/types/tiposBuilder";
import { useEstadoBuilder } from "@/features/builder/estadoBuilder";

// === INSPECTOR | inicio ===
export function Inspector(_props: { obterTamanhoCanvasPx: () => { w: number; h: number } }) {
  const { elementos, elementoSelecionadoId, selecionarElemento, atualizarElemento, removerElemento, iniciarTransacaoHistorico, finalizarTransacaoHistorico } = useEstadoBuilder();

  const elemento = useMemo(() => elementos.find((e) => e.id === elementoSelecionadoId) ?? null, [elementos, elementoSelecionadoId]);

  // === PAIS & BREADCRUMB | inicio ===
  const paiNome = useMemo(() => {
    if (!elemento) return "—";
    if (!elemento.paiId) return "Canvas";
    const pai = elementos.find((e) => e.id === elemento.paiId);
    if (!pai) return "Canvas";
    return pai.nomeCustom || pai.descricao || pai.tipo;
  }, [elemento, elementos]);

  const caminho = useMemo(() => {
    if (!elemento) return [];
    const arr: ElementoBuilder[] = [];
    let atual: ElementoBuilder | undefined | null = elemento;
    while (atual) {
      arr.unshift(atual);
      if (!atual.paiId) break;
      atual = elementos.find((e) => e.id === atual!.paiId) ?? null;
    }
    return arr;
  }, [elemento, elementos]);
  // === PAIS & BREADCRUMB | fim ===

  const faixaZ = useMemo(() => {
    if (elementos.length === 0) return { min: -5, max: 15 };
    const minAtual = elementos.reduce((menor, item) => Math.min(menor, item.zIndex), 0);
    const maxAtual = elementos.reduce((maior, item) => Math.max(maior, item.zIndex), 0);
    return {
      min: Math.min(-5, minAtual - 1),
      max: Math.max(15, maxAtual + 1),
    };
  }, [elementos]);

  // === COR | inicio ===
  const [hexCustom, setHexCustom] = useState("#6366f1");
  function aplicarCor(alvo: "bg" | "text" | "border", token: string, hex: string) {
    if (!elemento) return;
    const parcial: Partial<ElementoBuilder> = {};
    if (alvo === "border") parcial.corBorda = { tokenTailwind: token || null, hex };
    if (alvo === "text") parcial.corTexto = { tokenTailwind: token || null, hex };
    if (alvo === "bg") parcial.corFundo = { tokenTailwind: token || null, hex };
    atualizarElemento(elemento.id, parcial);
  }
  // === COR | fim ===

  if (!elemento) {
    return (
      <div className="h-full p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="text-xs font-extrabold text-white mb-1">Inspector</div>
        <div className="text-sm text-slate-400">Selecione um elemento no canvas.</div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 p-3 mr-10 rounded-2xl bg-slate-900 border border-slate-800 overflow-auto">
      {/* === HEADER INSPECTOR | inicio === */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs font-extrabold text-white">Inspector</div>
          <div className="text-[11px] text-slate-400">
            Tipo: <span className="text-slate-200 font-bold">{elemento.tipo}</span> • Pai: <span className="text-slate-200 font-bold">{paiNome}</span>
          </div>

          {/* Breadcrumb */}
          <div className="mt-1 text-[10px] text-slate-500">
            Caminho:{" "}
            {caminho.map((c, idx) => {
              const label = c.descricao?.trim() ? c.descricao.trim() : c.nomeCustom?.trim() ? c.nomeCustom.trim() : c.tipo;
              return (
                <span key={c.id}>
                  <span className={idx === caminho.length - 1 ? "text-amber-300 font-extrabold" : "text-slate-400"}>{label}</span>
                  {idx < caminho.length - 1 ? <span className="mx-1 text-slate-600">›</span> : null}
                </span>
              );
            })}
          </div>
        </div>

        <button onClick={() => selecionarElemento(null)} className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs font-extrabold">
          Fechar
        </button>
      </div>
      {/* === HEADER INSPECTOR | fim === */}

      {/* === CLASSE | inicio === */}
      <div className="mt-3 rounded-2xl bg-slate-950 border border-slate-800 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">Classe (className/class)</div>
        <input
          value={elemento.nomeCustom}
          onChange={(e) => atualizarElemento(elemento.id, { nomeCustom: normalizarClasse(e.target.value) })}
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Ex: cartao, header-principal, lista-itens"
        />
        <div className="mt-2 text-[10px] text-slate-500">Entra no prompt como: className/class. Não aparece como etiqueta no Canvas.</div>
      </div>
      {/* === CLASSE | fim === */}

      {/* === DESCRICAO | inicio === */}
      <div className="mt-3 rounded-2xl bg-slate-950 border border-slate-800 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">Descrição (somente Canvas)</div>
        <textarea
          value={elemento.descricao}
          onChange={(e) => atualizarElemento(elemento.id, { descricao: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-y min-h-[72px]"
          placeholder="Ex: Área de conteúdo, Card do produto, Topo..."
        />
        <div className="mt-2 text-[10px] text-slate-500">Não entra no código final. Serve só para identificar no Canvas e aparece completo na etiqueta do elemento.</div>
      </div>
      {/* === DESCRICAO | fim === */}

      {/* === INSTRUÇÕES (aparece somente no PROMPT) | inicio === */}
      <div className="mt-3 rounded-2xl bg-slate-950 border border-slate-800 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">Instruções (somente PROMPT)</div>
        <textarea
          value={elemento.instrucoes}
          onChange={(e) => atualizarElemento(elemento.id, { instrucoes: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-y min-h-[72px]"
          placeholder="Ex: mantenha alinhado à esquerda; deixe sticky; crie CTA; etc."
        />
        <div className="mt-2 text-[10px] text-slate-500">Aparece no PROMPT quando o modo “Instruções” estiver ativado.</div>
      </div>
      {/* === INSTRUÇÕES | fim === */}

      {/* === GEOMETRIA + TRAVAS RELACIONADAS | inicio === */}
      <div className="mt-3 rounded-2xl bg-slate-950 border border-slate-800 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">Geometria (%)</div>

        {/* Linha 1: X / Y / trava mover */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] items-end gap-2">
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold mb-1">X</div>
            <input
              type="number"
              value={round2(elemento.xPct)}
              onFocus={() => iniciarTransacaoHistorico()}
              onBlur={() => finalizarTransacaoHistorico()}
              onChange={(e) => atualizarElemento(elemento.id, { xPct: clampPct(Number(e.target.value), elemento.wPct) })}
              className="w-full min-w-0 px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono tabular-nums"
            />
          </div>

          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold mb-1">Y</div>
            <input
              type="number"
              value={round2(elemento.yPct)}
              onFocus={() => iniciarTransacaoHistorico()}
              onBlur={() => finalizarTransacaoHistorico()}
              onChange={(e) => atualizarElemento(elemento.id, { yPct: clampPctY(Number(e.target.value), elemento.hPct) })}
              className="w-full min-w-0 px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono tabular-nums"
            />
          </div>

          <button
            onClick={() => atualizarElemento(elemento.id, { moverTravado: !elemento.moverTravado })}
            className={
              "w-11 h-10 shrink-0 rounded-xl border flex items-center justify-center " +
              (elemento.moverTravado ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-200" : "bg-slate-900 border-slate-700 text-slate-200 hover:border-indigo-500")
            }
            title={elemento.moverTravado ? "Mover travado" : "Mover destravado"}
          >
            {elemento.moverTravado ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
          </button>
        </div>

        {/* Linha 2: W / H / trava resize / proporção */}
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px_44px] items-end gap-2">
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold mb-1">W</div>
            <input
              type="number"
              value={round2(elemento.wPct)}
              onFocus={() => iniciarTransacaoHistorico()}
              onBlur={() => finalizarTransacaoHistorico()}
              onChange={(e) =>
                atualizarElemento(elemento.id, {
                  wPct: clampWPct(Number(e.target.value), elemento.xPct),
                  ...(elemento.proporcaoTravada ? proporcaoWH(Number(e.target.value), elemento) : {}),
                })
              }
              className="w-full min-w-0 px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono tabular-nums"
            />
          </div>

          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold mb-1">H</div>
            <input
              type="number"
              value={round2(elemento.hPct)}
              onFocus={() => iniciarTransacaoHistorico()}
              onBlur={() => finalizarTransacaoHistorico()}
              onChange={(e) =>
                atualizarElemento(elemento.id, {
                  hPct: clampHPct(Number(e.target.value), elemento.yPct),
                  ...(elemento.proporcaoTravada ? proporcaoHW(Number(e.target.value), elemento) : {}),
                })
              }
              className="w-full min-w-0 px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono tabular-nums"
            />
          </div>

          <button
            onClick={() => atualizarElemento(elemento.id, { resizeTravado: !elemento.resizeTravado })}
            className={
              "w-11 h-10 shrink-0 rounded-xl border flex items-center justify-center " +
              (elemento.resizeTravado ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-200" : "bg-slate-900 border-slate-700 text-slate-200 hover:border-indigo-500")
            }
            title={elemento.resizeTravado ? "Resize travado" : "Resize destravado"}
          >
            {elemento.resizeTravado ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
          </button>

          <button
            onClick={() => atualizarElemento(elemento.id, { proporcaoTravada: !elemento.proporcaoTravada })}
            className={
              "w-11 h-10 shrink-0 rounded-xl border flex items-center justify-center " +
              (elemento.proporcaoTravada ? "bg-amber-500/10 border-amber-500/40 text-amber-200" : "bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-500")
            }
            title={elemento.proporcaoTravada ? "Proporção travada" : "Proporção destravada"}
          >
            {elemento.proporcaoTravada ? <Link2 className="w-4 h-4" /> : <Link2Off className="w-4 h-4" />}
          </button>
        </div>

        <div className="mt-2 text-[10px] text-slate-500">Dica: Shift + setas move 10px. Valores aplicam automaticamente ao digitar.</div>
      </div>
      {/* === GEOMETRIA + TRAVAS RELACIONADAS | fim === */}

      {/* === CAMADAS | inicio === */}
      <div className="mt-3 rounded-2xl bg-slate-950 border border-slate-800 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">Camadas (z-index)</div>

        <div className="flex items-center gap-2">
          <div className="text-[10px] text-slate-500 font-extrabold">Trás</div>
          <input
            type="range"
            min={faixaZ.min}
            max={faixaZ.max}
            step={1}
            value={elemento.zIndex}
            onChange={(e) => atualizarElemento(elemento.id, { zIndex: clamp(Number(e.target.value), faixaZ.min, faixaZ.max) })}
            className="flex-1 accent-indigo-500"
          />
          <div className="text-[10px] text-slate-500 font-extrabold">Frente</div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>{faixaZ.min}</span>
          <span className="text-slate-200 font-extrabold">z-index-{elemento.zIndex}</span>
          <span>{faixaZ.max}</span>
        </div>
      </div>
      {/* === CAMADAS | fim === */}

      {/* === CORES | inicio === */}
      <div className="mt-3 rounded-2xl bg-slate-950 border border-slate-800 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">Cores</div>

        <div className="grid grid-cols-1 gap-2">
          <ResumoCor label="Borda" token={elemento.corBorda.tokenTailwind} hex={elemento.corBorda.hex} />
          <ResumoCor label="Texto" token={elemento.corTexto.tokenTailwind} hex={elemento.corTexto.hex} />
          <ResumoCor label="Fundo" token={elemento.corFundo.tokenTailwind} hex={elemento.corFundo.hex} />
        </div>

        <div className="mt-3">
          <PaletaTailwind onSelecionar={aplicarCor} />
        </div>
      </div>
      {/* === CORES | fim === */}

      {/* === PROPS DO ELEMENTO | inicio === */}
      <div className="mt-3 rounded-2xl bg-slate-950 border border-slate-800 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">Props do elemento</div>

        {elemento.tipo === "navbar" ? (
          <div className="space-y-2">
            <div className="text-[10px] text-slate-400 font-bold">Logo</div>
            <input
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
              value={elemento.props.logo ?? ""}
              onChange={(e) => atualizarElemento(elemento.id, { props: { ...elemento.props, logo: e.target.value } })}
            />
            <div className="text-[10px] text-slate-400 font-bold">Links (separados por vírgula)</div>
            <input
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
              value={(elemento.props.links ?? []).join(", ")}
              onChange={(e) =>
                atualizarElemento(elemento.id, {
                  props: {
                    ...elemento.props,
                    links: e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  },
                })
              }
            />
            <div className="text-[10px] text-slate-400 font-bold">CTA</div>
            <input
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
              value={elemento.props.cta ?? ""}
              onChange={(e) => atualizarElemento(elemento.id, { props: { ...elemento.props, cta: e.target.value } })}
            />
          </div>
        ) : elemento.tipo === "botao" ? (
          <div className="space-y-2">
            <div className="text-[10px] text-slate-400 font-bold">Texto</div>
            <input
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
              value={elemento.props.texto ?? ""}
              onChange={(e) => atualizarElemento(elemento.id, { props: { ...elemento.props, texto: e.target.value } })}
            />
            <div className="text-[10px] text-slate-400 font-bold">Variante</div>
            <select
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
              value={elemento.props.variante ?? "primario"}
              onChange={(e) => atualizarElemento(elemento.id, { props: { ...elemento.props, variante: e.target.value } })}
            >
              <option value="primario">Primário</option>
              <option value="secundario">Secundário</option>
              <option value="fantasma">Fantasma</option>
              <option value="perigo">Perigo</option>
            </select>
          </div>
        ) : elemento.tipo === "titulo" || elemento.tipo.startsWith("tag_h") || elemento.tipo === "tag_p" || elemento.tipo === "texto" ? (
          <div className="space-y-2">
            <div className="text-[10px] text-slate-400 font-bold">Texto</div>
            <input
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
              value={elemento.props.texto ?? ""}
              onChange={(e) => atualizarElemento(elemento.id, { props: { ...elemento.props, texto: e.target.value } })}
              placeholder="Ex: Título principal"
            />
          </div>
        ) : null}
      </div>
      {/* === PROPS DO ELEMENTO | fim === */}

      {/* === AÇÕES | inicio === */}
      <div className="mt-3 rounded-2xl bg-slate-950 border border-slate-800 p-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Ações</div>
          <div className="text-[11px] text-slate-500">Deletar remove somente este elemento (filhos são promovidos).</div>
        </div>
        <button onClick={() => removerElemento(elemento.id)} className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold">
          Deletar
        </button>
      </div>
      {/* === AÇÕES | fim === */}
    </div>
  );
}

function ResumoCor(props: { label: string; token: string | null; hex: string }) {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-2">
      <div className="text-[10px] text-slate-400 font-bold">{props.label}</div>
      <div className="text-[11px] text-slate-200 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
        {props.token ? `${props.token.replace(/^(bg|text|border)-/, "")} | ` : "custom | "}
        {props.hex}
      </div>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  if (Number.isNaN(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function round2(v: number) {
  return Math.round(v * 100) / 100;
}

function clampWPct(w: number, x: number) {
  return clamp(w, 1, 100 - x);
}

function clampHPct(h: number, y: number) {
  return clamp(h, 1, 100 - y);
}

function clampPct(x: number, w: number) {
  return clamp(x, 0, 100 - w);
}

function clampPctY(y: number, h: number) {
  return clamp(y, 0, 100 - h);
}

function proporcaoWH(novoW: number, el: ElementoBuilder) {
  if (el.hPct <= 0) return {};
  const proporcao = el.wPct / el.hPct;
  const w = clampWPct(novoW, el.xPct);
  const h = clampHPct(w / proporcao, el.yPct);
  return { hPct: h };
}

function proporcaoHW(novoH: number, el: ElementoBuilder) {
  if (el.hPct <= 0) return {};
  const proporcao = el.wPct / el.hPct;
  const h = clampHPct(novoH, el.yPct);
  const w = clampWPct(h * proporcao, el.xPct);
  return { wPct: w };
}

function normalizarClasse(valor: string) {
  return valor
    .toLowerCase()
    .replace(/[^a-z0-9\-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
// === INSPECTOR | fim ===
