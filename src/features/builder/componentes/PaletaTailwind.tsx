import {
  useMemo,
  useState,
} from "react";
import {
  coresTailwind,
  nomesCoresTailwind,
  tonsTailwind,
} from "@/utils/coresTailwind";

// === PALETA TAILWIND | inicio ===
type Aba = "bg" | "text" | "border";
type NomeCorTailwind =
  keyof typeof coresTailwind;
type TomTailwind =
  (typeof tonsTailwind)[number];

export function PaletaTailwind(props: {
  onSelecionar: (
    alvo: Aba,
    token: string,
    hex: string,
  ) => void;
}) {
  const grupos = useMemo(
    () =>
      nomesCoresTailwind as NomeCorTailwind[],
    [],
  );
  const [aba, setAba] =
    useState<Aba>("bg"); // bg sempre selecionada por padrão
  const [
    corSelecionada,
    setCorSelecionada,
  ] =
    useState<NomeCorTailwind>("indigo");
  const [mostrarRgb, setMostrarRgb] =
    useState(false);
  const [rgb, setRgb] = useState({
    r: 99,
    g: 102,
    b: 241,
  });

  const tons = useMemo(
    () =>
      [
        ...tonsTailwind,
      ] as TomTailwind[],
    [],
  );
  const hex500 = (
    cor: NomeCorTailwind,
  ) =>
    coresTailwind[cor][500] ??
    "#000000";

  function tokenPara(
    alvo: Aba,
    cor: NomeCorTailwind,
    tom: TomTailwind,
  ) {
    const prefixo =
      alvo === "bg"
        ? "bg"
        : alvo === "text"
          ? "text"
          : "border";
    return `${prefixo}-${cor}-${tom}`;
  }

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
      {/* === HEADER | inicio === */}
      <div className="text-sm uppercase tracking-wider text-white font-extrabold mb-2">
        {" "}
        Cores
      </div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAba("bg")}
            className={`px-2 py-1 rounded-lg border text-[10px] font-extrabold ${
              aba === "bg"
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-slate-900 text-slate-200 border-slate-800 hover:border-indigo-500"
            }`}
          >
            bg
          </button>
          <button
            type="button"
            onClick={() =>
              setAba("text")
            }
            className={`px-2 py-1 rounded-lg border text-[10px] font-extrabold ${
              aba === "text"
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-slate-900 text-slate-200 border-slate-800 hover:border-indigo-500"
            }`}
          >
            text
          </button>
          <button
            type="button"
            onClick={() =>
              setAba("border")
            }
            className={`px-2 py-1 rounded-lg border text-[10px] font-extrabold ${
              aba === "border"
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-slate-900 text-slate-200 border-slate-800 hover:border-indigo-500"
            }`}
          >
            border
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Hex picker */}
          <label
            className="w-7 h-7 rounded-full border-2 border-white/20 cursor-pointer hover:scale-105 transition-transform overflow-hidden"
            title="Selecionar cor custom (HEX)"
          >
            <input
              type="color"
              className="w-full h-full opacity-0 cursor-pointer"
              onChange={(e) =>
                props.onSelecionar(
                  aba,
                  "",
                  e.target.value,
                )
              }
            />
          </label>

          {/* RGB picker (simples) */}
          <button
            type="button"
            onClick={() =>
              setMostrarRgb((v) => !v)
            }
            className="w-7 h-7 rounded-full border-2 border-white/20 hover:scale-105 transition-transform bg-slate-900"
            title="Selecionar cor custom (RGB)"
          />
        </div>
      </div>
      {/* === HEADER | fim === */}

      {/* === RGB PICKER | inicio === */}
      {mostrarRgb ? (
        <div className="mt-3 rounded-2xl bg-slate-900/40 border border-slate-800 p-2">
          <div className="text-[10px] text-slate-400 font-bold mb-2">
            RGB custom
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[10px] text-slate-500 font-bold">
                R
              </div>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb.r}
                onChange={(e) =>
                  setRgb((v) => ({
                    ...v,
                    r: Number(
                      e.target.value,
                    ),
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold">
                G
              </div>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) =>
                  setRgb((v) => ({
                    ...v,
                    g: Number(
                      e.target.value,
                    ),
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold">
                B
              </div>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) =>
                  setRgb((v) => ({
                    ...v,
                    b: Number(
                      e.target.value,
                    ),
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-[10px] text-slate-400 font-mono">
              rgb({rgb.r},{rgb.g},
              {rgb.b})
            </div>
            <button
              type="button"
              onClick={() => {
                const hex = rgbParaHex(
                  rgb.r,
                  rgb.g,
                  rgb.b,
                );
                props.onSelecionar(
                  aba,
                  "",
                  hex,
                );
                setMostrarRgb(false);
              }}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold"
            >
              Aplicar
            </button>
          </div>
        </div>
      ) : null}
      {/* === RGB PICKER | fim === */}

      {/* === CORES (500) | inicio === */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-2">
        <div className="text-center text-[10px] text-slate-400 font-bold mb-2">
          Escolha uma cor
        </div>

        <div className="flex flex-wrap gap-1.5 ">
          {grupos.map((cor) => {
            const hex = hex500(cor);
            const ativo =
              corSelecionada === cor;
            return (
              <button
                key={cor}
                type="button"
                title={`${cor}-500 | ${hex}`}
                onClick={() =>
                  setCorSelecionada(cor)
                }
                className={`w-7 h-7 rounded-full border-2 transition ${
                  ativo
                    ? "border-white shadow-[0_0_0_2px_rgba(99,102,241,.45)]"
                    : "border-white/20 hover:scale-105"
                }`}
                style={{
                  background: hex,
                }}
              />
            );
          })}
        </div>

        <div className="mt-3 uppercase text-[10px] text-slate-500">
          Cor selecionada:{" "}
          <span className="text-slate-200 font-extrabold">
            {corSelecionada}
          </span>
        </div>
      </div>
      {/* === CORES (500) | fim === */}

      {/* === TONALIDADES | inicio === */}
      <div className="mt-3 rounded-2xl bg-slate-900/40 border border-slate-800 p-2 ">
        <div className="text-[10px] text-slate-400 font-bold mb-2">
          Tonalidades (clique para
          aplicar) • mostra token + HEX
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {tons.map((tom) => {
            const hex =
              coresTailwind[
                corSelecionada
              ][tom];
            if (!hex) return null;
            const token = tokenPara(
              aba,
              corSelecionada,
              tom,
            );

            return (
              <button
                key={tom}
                type="button"
                onClick={() =>
                  props.onSelecionar(
                    aba,
                    token,
                    hex,
                  )
                }
                className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-indigo-500"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-md border border-white/20"
                    style={{
                      background: hex,
                    }}
                  />
                  <div className="text-xs text-slate-100 font-extrabold whitespace-nowrap">
                    {corSelecionada}-
                    {tom}
                  </div>
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  {hex}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {/* === TONALIDADES | fim === */}
    </div>
  );
}

function rgbParaHex(
  r: number,
  g: number,
  b: number,
) {
  const toHex = (n: number) =>
    n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
// === PALETA TAILWIND | fim ===
