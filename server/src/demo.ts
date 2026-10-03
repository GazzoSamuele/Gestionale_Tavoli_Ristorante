const API = `${process.env.API_URL ?? "https://gestionale-tavoli-ristorante-backen.vercel.app"}/api`;
const SALA = "/piantine-sale/piantina1.svg";
const GIORNI = 7;
const PREFISSO_TELEFONO_DEMO = "3900000000";

interface Tavolo {
  _id: string;
  numero: number;
  sala: string;
}

interface Prenotazione {
  _id: string;
  telefono: string;
}

type Confermata = [tavolo: number, nome: string, persone: number, ora: string, note: string];
type DaGestire = [nome: string, persone: number, ora: string, note: string];

const CONFERMATE: Confermata[][] = [
  [[2, "Marco Rossi", 4, "20:00", ""], [4, "Giulia Bianchi", 6, "20:30", "Compleanno: portano loro la torta"], [8, "Luca Ferrari", 7, "21:00", ""]],
  [[3, "Sara Colombo", 3, "19:30", ""], [6, "Andrea Ricci", 8, "20:45", "Serve un seggiolone"], [1, "Elena Marino", 2, "21:15", ""]],
  [[7, "Davide Greco", 4, "20:00", ""], [10, "Chiara Bruno", 10, "20:30", "Cena aziendale"], [5, "Matteo Gallo", 2, "21:30", ""]],
  [[9, "Francesca Conti", 4, "19:45", ""], [15, "Alessandro De Luca", 6, "20:15", "Allergia ai crostacei"], [4, "Valentina Costa", 5, "21:00", ""]],
  [[2, "Simone Giordano", 3, "20:00", ""], [11, "Martina Mancini", 12, "20:30", "Festa di laurea"], [1, "Federico Rizzo", 2, "22:00", ""]],
  [[6, "Alice Lombardi", 7, "19:30", ""], [3, "Riccardo Moretti", 4, "20:30", ""], [12, "Laura Barbieri", 14, "21:00", "Cena di compleanno"]],
  [[5, "Paolo Fontana", 2, "20:00", "Anniversario"], [8, "Silvia Santoro", 8, "20:30", ""], [7, "Giorgio Mariani", 3, "21:15", ""]],
];

const DA_GESTIRE: DaGestire[][] = [
  [["Roberta Rinaldi", 2, "19:30", ""], ["Stefano Caruso", 5, "21:00", "Tavolo all'aperto se possibile"]],
  [["Ilaria Ferrara", 4, "20:00", ""], ["Nicola Galli", 2, "21:30", ""]],
  [["Beatrice Martini", 6, "19:45", "Un ospite vegano"], ["Tommaso Leone", 3, "21:15", ""]],
  [["Camilla Longo", 2, "20:30", ""], ["Lorenzo Gentile", 4, "21:00", ""]],
  [["Giorgia Martinelli", 5, "19:30", "Due bambini"], ["Emanuele Vitale", 2, "20:45", ""]],
  [["Irene Lombardo", 3, "20:00", ""], ["Daniele Serra", 6, "21:30", ""]],
  [["Noemi Coppola", 4, "19:45", ""], ["Filippo De Santis", 2, "21:00", "Senza glutine"]],
];

function dataTraGiorni(giorni: number): string {
  const d = new Date();
  d.setDate(d.getDate() + giorni);
  const mese = String(d.getMonth() + 1).padStart(2, "0");
  const giorno = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mese}-${giorno}`;
}

async function chiama<T>(percorso: string, opzioni: RequestInit = {}): Promise<T> {
  const risposta = await fetch(`${API}${percorso}`, {
    headers: { "Content-Type": "application/json" },
    ...opzioni,
  });
  if (!risposta.ok) {
    throw new Error(`${opzioni.method ?? "GET"} ${percorso}: ${risposta.status} ${await risposta.text()}`);
  }
  return (await risposta.json()) as T;
}

async function demo() {
  console.log(`Gestionale: ${API}`);

  const tavoli = (await chiama<Tavolo[]>("/tavoli")).filter((t) => t.sala === SALA);
  const idTavolo = (numero: number) => {
    const tavolo = tavoli.find((t) => t.numero === numero);
    if (!tavolo) throw new Error(`Nella sala 1 manca il tavolo ${numero}`);
    return tavolo._id;
  };

  const vecchie = (await chiama<Prenotazione[]>("/prenotazioni")).filter((p) =>
    p.telefono?.startsWith(PREFISSO_TELEFONO_DEMO),
  );
  for (const p of vecchie) {
    await chiama(`/prenotazioni/${p._id}`, { method: "DELETE" });
  }
  console.log(`Tolte ${vecchie.length} prenotazioni demo vecchie`);

  let telefono = 1;
  const nuovoTelefono = () => `${PREFISSO_TELEFONO_DEMO}${String(telefono++).padStart(2, "0")}`;
  let create = 0;

  for (let g = 0; g < GIORNI; g++) {
    const data = dataTraGiorni(g);

    for (const [i, [numero, nome, persone, ora, note]] of CONFERMATE[g].entries()) {
      await chiama("/prenotazioni", {
        method: "POST",
        body: JSON.stringify({
          nome, persone, ora, data, note,
          telefono: nuovoTelefono(),
          stato: "Confermato",
          tavoloId: idTavolo(numero),
          whatsappInviato: i !== 1,
        }),
      });
      create++;
    }

    for (const [nome, persone, ora, note] of DA_GESTIRE[g]) {
      await chiama("/prenotazioni", {
        method: "POST",
        body: JSON.stringify({
          nome, persone, ora, data, note,
          telefono: nuovoTelefono(),
          stato: "Richiesta Conferma",
          tavoloId: null,
          whatsappInviato: false,
        }),
      });
      create++;
    }
  }

  console.log(`Create ${create} prenotazioni demo, dal ${dataTraGiorni(0)} al ${dataTraGiorni(GIORNI - 1)}`);
}

demo().catch((errore) => {
  console.error("❌ Demo non riuscita:", errore instanceof Error ? errore.message : errore);
  process.exitCode = 1;
});
