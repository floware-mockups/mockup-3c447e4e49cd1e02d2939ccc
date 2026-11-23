// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ChiusuraAutomaticaSospensioni");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ChiusuraAutomaticaSospensioni");
import { useEffect, useState } from "react";
import { Card, useTable, type SectionProps } from "../floware";

function dataFine(testo: string) {__mk();
  const valore = testo.trim();
  const italiana = valore.includes("/");
  const parti = italiana ? valore.split("/") : valore.split("-");
  if (parti.length !== 3 || parti.some((parte) => (__mk(), parte.trim() === ""))) return null;
  const indiceAnno = italiana ? 2 : 0;
  const indiceGiorno = italiana ? 0 : 2;
  const anno = Number(parti[indiceAnno]);
  const mese = Number(parti[1]);
  const giorno = Number(parti[indiceGiorno]);
  if (!Number.isInteger(anno) || anno < 1000 || anno > 9999 || !Number.isInteger(mese) || !Number.isInteger(giorno)) return null;
  const data = new Date(anno, mese - 1, giorno);
  if (data.getFullYear() !== anno || data.getMonth() !== mese - 1 || data.getDate() !== giorno) return null;
  return data.getTime();
}

export default function ChiusuraAutomaticaSospensioni({ pageId }: SectionProps) {__mk();
  const cruscotto = useTable("cruscotto");
  const pratiche = useTable("pratiche");
  const [controllo, setControllo] = useState(0);

  useEffect(() => {__mk();
    let attivo = true;
    setTimeout(() => {__mk();
      if (attivo) setControllo((precedente) => (__mk(), precedente + 1));
    }, 30000);
    return () => {__mk(); attivo = false; };
  }, [controllo]);

  useEffect(() => {__mk();
    const adesso = new Date();
    const oggi = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate()).getTime();
    for (const tabella of [cruscotto, pratiche]) {__mk();
      if (!tabella) continue;
      const fine = tabella.column("Fine teorica");
      const stato = tabella.column("Stato");
      if (fine < 0 || stato < 0) continue;
      tabella.rows.forEach((riga, indice) => {__mk();
        const termine = dataFine(riga[fine] || "");
        if (termine !== null && termine < oggi && riga[stato] !== "Chiusa agli atti") {
          tabella.setCell(indice, "Stato", "Chiusa agli atti");
        }
      });
    }
  }, [cruscotto, pratiche, controllo]);

  if (pageId !== "cruscotto" && pageId !== "pratiche") return null;
  const tabella = pageId === "cruscotto" ? cruscotto : pratiche;
  if (!tabella) return null;
  if (tabella.column("Fine teorica") < 0 || tabella.column("Stato") < 0) {
    return <p>Chiusura automatica non disponibile: servono le colonne «Fine teorica» e «Stato».</p>;
  }
  return (
    <Card title="Chiusura automatica attiva">
      <p>Le pratiche con fine teorica precedente a oggi passano a «Chiusa agli atti». Le scadenze odierne e future mantengono lo stato attuale.</p>
      <p className="text-(--mk-muted) text-sm">Controllo all’apertura, alle modifiche e ogni 30 secondi mentre il prototipo è aperto. Le date mancanti o non valide non modificano lo stato. Gli aggiornamenti restano in memoria.</p>
    </Card>
  );
}
