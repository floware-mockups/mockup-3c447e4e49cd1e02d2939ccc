// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("PeriodiEvidenziati");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("PeriodiEvidenziati");
import { Card, useTable, type SectionProps } from "../floware";

function leggiData(testo: string) {__mk();
  const valore = testo.trim();
  const italiana = valore.includes("/");
  const parti = italiana ? valore.split("/") : valore.split("-");
  if (parti.length !== 3) return null;
  const indiceAnno = italiana ? 2 : 0;
  const indiceGiorno = italiana ? 0 : 2;
  const anno = Number(parti[indiceAnno]);
  const mese = Number(parti[1]);
  const giorno = Number(parti[indiceGiorno]);
  if (!Number.isInteger(anno) || !Number.isInteger(mese) || !Number.isInteger(giorno) || anno < 1000 || anno > 9999 || mese < 1 || mese > 12 || giorno < 1 || giorno > 31) return null;
  const tempo = Date.UTC(anno, mese - 1, giorno);
  const data = new Date(tempo);
  if (data.getUTCFullYear() !== anno || data.getUTCMonth() !== mese - 1 || data.getUTCDate() !== giorno) return null;
  return tempo;
}

function mostraData(tempo: number) {__mk();
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(tempo));
}

export default function PeriodiEvidenziati({ pageId }: SectionProps) {__mk();
  const table = useTable(pageId);
  if (!table || !["pratiche", "cruscotto", "intervalli"].includes(pageId)) return null;
  const intermedi = pageId === "intervalli";
  const colInizio = intermedi ? "Dal" : "Decorrenza";
  const colFine = intermedi ? "Al" : "Fine teorica";
  if (table.column(colInizio) < 0 || table.column(colFine) < 0 || table.column("Codice pratica") < 0) return <p className="text-(--mk-muted)">Per mostrare i periodi servono il codice pratica e le colonne delle date.</p>;
  const periodi = table.rows.map((riga, indice) => {__mk();
    const dal = table.value(riga, colInizio);
    const al = table.value(riga, colFine);
    return { indice, codice: table.value(riga, "Codice pratica"), tipo: intermedi && table.column("Tipo intervallo") >= 0 ? table.value(riga, "Tipo intervallo") : "Sospensione", dal, al, inizio: leggiData(dal), fine: leggiData(al) };
  });
  const validi = periodi.filter((p) => (__mk(), p.inizio !== null && p.fine !== null && p.fine >= p.inizio));
  const primo = validi[0];
  const baseInizio = primo && primo.inizio !== null ? primo.inizio : 0;
  const baseFine = primo && primo.fine !== null ? primo.fine : 0;
  const minimo = validi.reduce((valore, p) => (__mk(), Math.min(valore, p.inizio === null ? valore : p.inizio)), baseInizio);
  const massimo = validi.reduce((valore, p) => (__mk(), Math.max(valore, p.fine === null ? valore : p.fine)), baseFine);
  const giorno = 86400000;
  const ampiezza = Math.max(giorno, massimo - minimo + giorno);
  return (
    <Card title={intermedi ? "Intervalli intermedi e presofferto" : "Periodi di sospensione"}>
      <div className="space-y-4 text-(--mk-text)">
        <p className="text-sm text-(--mk-muted)">Le barre rosse indicano il periodo da {colInizio} a {colFine}. Le date sono quelle riportate nella tabella, senza ricalcoli.</p>
        {validi.length > 0 && <div className="flex justify-between gap-4 text-xs text-(--mk-muted)"><span>{mostraData(minimo)}</span><span>{mostraData(massimo)}</span></div>}
        {periodi.length === 0 && <p className="text-sm text-(--mk-muted)">Nessun periodo registrato.</p>}
        {periodi.map((p) => {__mk();
          const valido = p.inizio !== null && p.fine !== null && p.fine >= p.inizio;
          const sinistra = valido && p.inizio !== null ? (p.inizio - minimo) / ampiezza * 100 : 0;
          const larghezza = valido && p.inizio !== null && p.fine !== null ? (p.fine - p.inizio + giorno) / ampiezza * 100 : 0;
          return <div key={p.indice} className="space-y-2 border-b border-(--mk-divider) pb-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-semibold">{p.codice} <span className="text-sm font-normal text-(--mk-muted)">{p.tipo}</span></span>
              <span className="text-sm font-semibold text-(--mk-danger)">{colInizio}: {p.dal || "—"} · {colFine}: {p.al || "—"}</span>
            </div>
            {valido ? <div className="overflow-hidden rounded bg-(--mk-subtle)" role="img" aria-label={p.codice + ": dal " + p.dal + " al " + p.al}>
              <div className="h-3 rounded" style={{ marginLeft: String(sinistra) + "%", width: String(larghezza) + "%", minWidth: "2px", backgroundColor: "var(--mk-danger)" }} />
            </div> : <p className="text-sm text-(--mk-muted)">Intervallo non rappresentabile: controllare le date.</p>}
          </div>;
        })}
      </div>
    </Card>
  );
}
