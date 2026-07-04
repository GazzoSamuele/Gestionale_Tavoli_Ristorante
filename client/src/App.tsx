import { useState, useEffect, type SubmitEvent } from 'react';

import './App.scss'

// INTERFACCIA TS PER LA VISUALIZZAZIONE DELL'UNITA' "PRENOTAZIONE"
interface Prenotazione {
  id: number;
  nome: string;
  persone: number;
  ora: string;
}

const prenotazioniFinte: 
Prenotazione[] = [
  { id: 1, nome: 'Rossi',   persone: 4, ora: '22:00' },
  { id: 2, nome: 'Bianchi', persone: 2, ora: '19:30' },
  { id: 3, nome: 'Verdi',   persone: 6, ora: '19:00' },
  { id: 4, nome: 'Gialli',   persone: 2, ora: '20:15' },
  { id: 5, nome: 'Blu', persone: 1, ora: '20:45' },
  { id: 6, nome: 'Viola',   persone: 8, ora: '21:00' },
  { id: 7, nome: 'Scuri', persone: 8, ora: '20:30' },
  { id: 8, nome: 'Chiari',   persone: 12, ora: '21:30' },
]

// INTERFACCIA TS PER LA VISUALIZZAZIONE DELL'UNITA' "TAVOLO"
interface Tavolo {
  _id: string;
  numero: number;
  posti: number;
  stato: 'libero' | 'occupato' | 'riservato';
  oraArrivo?: string; 

  posX: number;
  posY: number;
}

interface TavoloCardProps {
  tavolo: Tavolo;
  onDelete: (id: string) => void;
  onUpdateStato: (id: string, nuovoStato: string) => void;
  onAssing: (tavolo: Tavolo) => void;
}

function TavoloCard({ tavolo, onDelete, onUpdateStato, onAssing }: TavoloCardProps) {

  return (
    <div className={`tavolo-card tavolo-${tavolo.stato}`} onClick={() => onAssing(tavolo)}>
        <h2>Tavolo {tavolo.numero}</h2>
        <p>{tavolo.posti} posti</p>
        <p>{tavolo.stato}</p>
      
        <select value={tavolo.stato} onChange={(e) => onUpdateStato(tavolo._id, e.target.value)}>
          <option value="libero">Libero</option>
          <option value="occupato">Occupato</option>
          <option value="riservato">Riservato</option>
        </select>
        <button onClick={() => onDelete(tavolo._id)}>Elimina</button>
    </div>
  )
}
function App() {

  const [numero, setNumero] = useState('')
  const [posti, setPosti] = useState('')
  const [tavoli, setTavoli] = useState<Tavolo[]>([])

  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>(prenotazioniFinte)
  const [prenotazioneSelezionata, setPrenotazioneSelezionata] = useState<Prenotazione | null>(null)

  useEffect(() => {
  fetch('http://localhost:3000/api/tavoli')
    .then(res => res.json())
    .then(data => setTavoli(data))
    .catch(err => console.error(err))
}, [])

// SEZIONE TAVOLI

// RICHIAMO OPERAZIONI CRUD 

// AGGIUNGI 
const handleSubmit = async (e: SubmitEvent) => {
  e.preventDefault()

  const res = await fetch('http://localhost:3000/api/tavoli', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({ numero: Number(numero), posti: Number(posti)})
  })

  if (!res.ok) {
    alert('Errore nella creazione: controlla i dati (numero forse duplicato)')
    return
  }
  const nuovoTavolo = await res.json()
  setTavoli([...tavoli, nuovoTavolo])
  setNumero('')
  setPosti('')
}

// CANCELLA
const handleDelete = async (id: string) => {
  const res = await
    fetch(`http://localhost:3000/api/tavoli/${id}`, {
      method: 'DELETE'
    })
    if(!res.ok) {
      alert('errore durante la procedura di eliminazione')
      return
    }
    setTavoli(tavoli.filter((tavolo) => tavolo._id !== id))
}

// MODIFICA
const handleUpdate = async (id: string, nuovoStato: string) => {
  const res = await fetch(`http://localhost:3000/api/tavoli/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({ stato: nuovoStato })
  })
  if (!res.ok) {
    alert('Errore nella modifica')
    return
  }
  const aggiornamentoTavolo = await res.json()
  setTavoli(tavoli.map((t) => (t._id === id ? aggiornamentoTavolo : t)))
}

// SEZIONE PRENOTAZIONI

// ASSEGNAZIONE DELLA PRENOTAZIONE AL TAVOLO
const handleAssegna = (tavolo: Tavolo) => {
  // nessuna prenotazione scelta → non fare niente
  if(!prenotazioneSelezionata) 
    return

  // il tavolo diventa occupato (riusa la funzione PUT usata nella parte dei tavoli)
  handleUpdate(tavolo._id, 'occupato')

  // togli la prenotazione assegnata
  setPrenotazioni(prenotazioni.filter((p) => p.id !== prenotazioneSelezionata.id))

   // deseleziona
  setPrenotazioneSelezionata(null)
}
  

  return (
    <>
      <div>
        <h1>Gestione Tavoli Ristorante</h1>
          <p>Tavoli Totali: {tavoli.length}</p>
          <p>Tavoli Liberi: {tavoli.filter(t => t.stato === 'libero').length}</p>
          <p>Tavoli Occupati: {tavoli.filter(t => t.stato === 'occupato').length}</p>
      </div>

      {tavoli.length === 0 && <p>nessun tavolo disponibile, creane uno nuovo</p>}

       {/* FORM PER L'AGGIUNTA DI UN NUOVO TAVOLO */}
      <form onSubmit={handleSubmit}>
        <label>Numero Del Tavolo
          <input
            type="number"
            placeholder="Numero Del Tavolo"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
            min="1"
          />
        </label>

        <label>Posti max disponibili
          <input
            type="number"
            placeholder="Posti"
            value={posti}
            onChange={(e) => setPosti(e.target.value)}
            required
            min="1"
          />
        </label>
      <button type="submit">Aggiungi tavolo</button>
    </form>

    <aside className="pannello-prenotazioni">
      <h2>Prenotazioni</h2>
        {prenotazioni.map((pren) => (
          <div
            key={pren.id}
            className={`prenotazione-card ${prenotazioneSelezionata?.id === pren.id ? 'selezionata' : ''}`}
            onClick={() => setPrenotazioneSelezionata(pren)}
          >
          <div key={pren.id} className="prenotazione-card">
            <strong>{pren.nome}</strong>
              <p>{pren.persone} persone</p>
              <p>ore {pren.ora}</p>
          </div>
        </div>
    ))}
  </aside>

      <section className='sala'>
        <p>ecco i tavoli</p>
        {tavoli.map((tavolo) => (
          <TavoloCard
            key={tavolo._id}
            tavolo={tavolo}
            onDelete={handleDelete}
            onUpdateStato={handleUpdate}
            onAssing={handleAssegna}
          />
        ))}
      </section>
    </>
  )
}


export default App;
