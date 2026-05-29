import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ExternalLink, LayoutDashboard, Settings, Monitor, Grid3X3, Magnet, Layers, Undo2, Redo2 } from "lucide-react";
import { useEstadoBuilder } from "./estadoBuilder";
import type { TipoPresetResolucao, TipoStack } from "@/types/tiposBuilder";
import { PainelPecas } from "./componentes/PainelPecas";
import { Canvas } from "./componentes/Canvas";
import { Inspector } from "./componentes/Inspector";
import { CatalogoPage } from "@/features/catalog/CatalogoPage";

// === BUILDER PAGE | inicio ===
export function BuilderPage() {
  const {
    stack,
    setStack,
    presetResolucao,
    setPresetResolucao,
    resolucao,
    setResolucaoCustom,
    magnetismoAtivo,
    setMagnetismoAtivo,
    aninharAtivo,
    setAninharAtivo,
    desfazer,
    refazer,
    podeDesfazer,
    podeRefazer,
  } = useEstadoBuilder();

  // === ABAS (Arquiteto Visual / Catálogo Pro / Catálogo React) | inicio ===
  const [aba, setAba] = useState<"visual" | "pro" | "react">("visual");

  function alternarAba() {
    setAba((a) => (a === "visual" ? "pro" : a === "pro" ? "react" : "visual"));
  }
  // === ABAS (Arquiteto Visual / Catálogo Pro / Catálogo React) | fim ===

  // === MONITOR (2ª tela) | inicio ===
  function abrirMonitor() {
    const w = window.open("/viewpage", "monitor_page_architect", "popup=yes,width=1200,height=800");
    (window as any).__monitorRef = w;
    if (w) w.focus();
    else alert("O navegador bloqueou o pop-up. Permita pop-ups para abrir o Monitor.");
  }
  // === MONITOR (2ª tela) | fim ===

  // === ATALHOS (DESFAZER/REFAZER) | inicio ===
  useEffect(() => {
    function emInputAtivo() {
      const el = document.activeElement;
      if (!el) return false;
      const tag = (el as HTMLElement).tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || (el as HTMLElement).isContentEditable;
    }

    function onKey(e: KeyboardEvent) {
      if (emInputAtivo()) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      // Ctrl+Z -> desfazer
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        desfazer();
        return;
      }

      // Ctrl+Y ou Ctrl+Shift+Z -> refazer
      if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
        e.preventDefault();
        refazer();
        return;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [desfazer, refazer]);
  // === ATALHOS (DESFAZER/REFAZER) | fim ===

  // === TAMANHO DO CANVAS (px) | inicio ===
  const [tamanhoCanvasPx, setTamanhoCanvasPx] = useState({ w: 1, h: 1 });
  const ultimoTamanhoRef = useRef({ w: 1, h: 1 });

  const aoObterTamanhoPx = useCallback((w: number, h: number) => {
    const atual = ultimoTamanhoRef.current;
    if (atual.w === w && atual.h === h) return;
    ultimoTamanhoRef.current = { w, h };
    setTamanhoCanvasPx({ w, h });
  }, []);
  // === TAMANHO DO CANVAS (px) | fim ===

  // === DADOS (selects) | inicio ===
  const stacks: TipoStack[] = useMemo(
    () => ["HTML + Tailwind", "HTML + Bootstrap 5", "HTML + CSS puro", "React + Vite + Tailwind", "Next.js + Tailwind", "Vue 3 + Tailwind", "Angular + Tailwind"],
    [],
  );

  const presets: TipoPresetResolucao[] = useMemo(
    () => [
      "Desktop 1920x1080",
      "Notebook 1366x768",
      "Tablet 1024x768",
      "Tablet 834x1112",
      "Mobile 390x844",
      "Mobile 360x800",
      "Ultrawide 2560x1080",
      "Ultrawide 3440x1440",
      "4K 3840x2160",
      "Custom",
    ],
    [],
  );

  const uiUltrawide = presetResolucao.startsWith("Ultrawide");
  // === DADOS (selects) | fim ===

  // === CONTROLES HEADER (toggle icons) | inicio ===
  function toggleGrade() {
    setResolucaoCustom({ mostrarGrade: !resolucao.mostrarGrade });
  }
  // === CONTROLES HEADER (toggle icons) | fim ===

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100">
      {/* === HEADER (tudo no header) | inicio === */}
      <div className="shrink-0 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="px-3 py-3 flex items-center justify-between gap-3">
          {/* Esquerda */}
          <div className="flex items-center gap-2">
            <button
              onClick={abrirMonitor}
              className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-900 hover:border-emerald-500 flex items-center justify-center"
              title="Abrir Monitor (2ª tela)"
            >
              <ExternalLink className="w-4 h-4 text-emerald-300" />
            </button>

            <button
              onClick={alternarAba}
              className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-900 hover:border-indigo-500 flex items-center justify-center"
              title="Alternar telas (Arquiteto Visual / Catálogo Pro / Catálogo React)"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-300" />
            </button>

            <div className="leading-tight text-sm font-extrabold text-slate-100 select-none">Arquiteto Web</div>
          </div>

          {/* Centro */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <div className="relative w-[320px] max-w-[40vw]">
              <Settings className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={stack}
                onChange={(e) => setStack(e.target.value as TipoStack)}
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {stacks.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="relative w-[280px] max-w-[35vw]">
              <Monitor className="w-4 h-4 text-amber-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={presetResolucao}
                onChange={(e) => setPresetResolucao(e.target.value as TipoPresetResolucao)}
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-amber-950/40 border border-amber-700/40 text-amber-100 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              >
                {presets.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-amber-200 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {presetResolucao === "Custom" ? (
              <div className="hidden xl:grid grid-cols-4 gap-2">
                <Numero label="Largura" value={resolucao.larguraPx} onChange={(v) => setResolucaoCustom({ larguraPx: v })} />
                <Numero label="Altura" value={resolucao.alturaPx} onChange={(v) => setResolucaoCustom({ alturaPx: v })} />
                <Numero label="Colunas" value={resolucao.colunas} onChange={(v) => setResolucaoCustom({ colunas: v })} />
                <Numero label="Linhas" value={resolucao.linhas} onChange={(v) => setResolucaoCustom({ linhas: v })} />
              </div>
            ) : null}
          </div>

          {/* Direita */}
          <div className="flex items-center gap-2">
            <IconToggle
              ativo={resolucao.mostrarGrade}
              onClick={toggleGrade}
              title={resolucao.mostrarGrade ? "Ocultar grade" : "Mostrar grade"}
              classAtivo="border-indigo-500/40 text-indigo-200 bg-indigo-500/10"
            >
              <Grid3X3 className="w-4 h-4" />
            </IconToggle>

            <IconBotao onClick={() => desfazer()} disabled={!podeDesfazer()} title="Desfazer (Ctrl+Z)">
              <Undo2 className="w-4 h-4" />
            </IconBotao>

            <IconBotao onClick={() => refazer()} disabled={!podeRefazer()} title="Refazer (Ctrl+Y / Ctrl+Shift+Z)">
              <Redo2 className="w-4 h-4" />
            </IconBotao>

            <IconToggle
              ativo={magnetismoAtivo}
              onClick={() => setMagnetismoAtivo(!magnetismoAtivo)}
              title={magnetismoAtivo ? "Magnetismo (ON)" : "Magnetismo (OFF)"}
              classAtivo="border-emerald-500/40 text-emerald-200 bg-emerald-500/10"
            >
              <Magnet className="w-4 h-4" />
            </IconToggle>

            <IconToggle
              ativo={aninharAtivo}
              onClick={() => setAninharAtivo(!aninharAtivo)}
              title={aninharAtivo ? "Aninhar (ON)" : "Aninhar (OFF)"}
              classAtivo="border-amber-500/40 text-amber-200 bg-amber-500/10"
            >
              <Layers className="w-4 h-4" />
            </IconToggle>
          </div>
        </div>
      </div>
      {/* === HEADER (tudo no header) | fim === */}

      {/* === CONTEÚDO | inicio === */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {aba === "pro" ? <CatalogoPage tipo="pro" /> : null}
        {aba === "react" ? <CatalogoPage tipo="react" /> : null}

        {aba === "visual" ? (
          <div className="h-full w-full overflow-hidden px-3 py-3">
            <div className={"h-full grid grid-cols-1 gap-3 " + (uiUltrawide ? "xl:grid-cols-[24vw_52vw_24vw]" : "xl:grid-cols-[18vw_60vw_22vw]")}>
              <div className="min-h-0 overflow-hidden">
                <PainelPecas />
              </div>

              <div className="min-h-0 overflow-hidden">
                <Canvas onObterTamanhoPx={aoObterTamanhoPx} />
              </div>

              <div className="min-h-0 overflow-hidden">
                <Inspector obterTamanhoCanvasPx={() => tamanhoCanvasPx} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {/* === CONTEÚDO | fim === */}
    </div>
  );
}

function Numero(props: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 px-2 py-1.5">
      <div className="text-[10px] text-slate-400 font-extrabold">{props.label}</div>
      <input type="number" className="w-full bg-transparent outline-none text-slate-100 text-sm" value={props.value} onChange={(e) => props.onChange(Number(e.target.value))} />
    </div>
  );
}

function IconBotao(props: { children: ReactNode; onClick: () => void; disabled?: boolean; title: string }) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.title}
      className={
        "w-10 h-10 rounded-xl border flex items-center justify-center transition-colors " +
        (props.disabled ? "border-slate-900 bg-slate-900/50 text-slate-600 cursor-not-allowed" : "border-slate-800 bg-slate-900 text-slate-200 hover:border-indigo-500")
      }
    >
      {props.children}
    </button>
  );
}

function IconToggle(props: { children: ReactNode; ativo: boolean; onClick: () => void; title: string; classAtivo: string }) {
  return (
    <button
      onClick={props.onClick}
      title={props.title}
      className={
        "w-10 h-10 rounded-xl border flex items-center justify-center transition-colors " +
        (props.ativo ? props.classAtivo : "border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-600")
      }
    >
      {props.children}
    </button>
  );
}
// === BUILDER PAGE | fim ===
