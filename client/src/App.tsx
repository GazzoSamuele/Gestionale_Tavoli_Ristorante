import { useState, useEffect, useRef, type SubmitEvent, type PointerEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons'

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

const saleDisponibili = [
  { nome: 'layout sala 1', img: '/piantine-sale/piantina1.svg' },
  { nome: 'layout sala 2', img: '/piantine-sale/piantina2.svg' },
  { nome: 'layout sala 3', img: '/piantine-sale/piantina3.svg' },
  { nome: 'layout sala 4', img: '/piantine-sale/piantina4.svg' },
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
  onMuovi: (id: string, posX: number, posY: number) => void;
}

function TavoloCard({ tavolo, onDelete, onUpdateStato, onAssing, onMuovi }: TavoloCardProps) {

  // la posizione attuale della carta (parte da quella salvata nel DB)
  const [pos, setPos] = useState({ x: tavolo.posX, y: tavolo.posY})

  // "scatola" che ricorda da dove è partito il drag (non causa ridisegni)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0, dragging: false})

  const handlePointerDown = (e: PointerEvent<HTMLElement>) => 
    {
      dragStart.current = { 
        mouseX: e.clientX, 
        mouseY: e.clientY,
        posX: pos.x,
        posY: pos.y,
        dragging: true
      }

      // "aggancia" il puntatore alla maniglia
      e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: PointerEvent<HTMLElement>) =>
  {
    if(!dragStart.current.dragging)
      return

    // trova il contenitore sala
     const sala = e.currentTarget.closest('.sala')
      if (!sala) 
        return

    // le sue dimensioni attuali in px 
      const rect = sala.getBoundingClientRect() 

    // converti lo spostamento del mouse (px) in percentuale della sala
    const dxPct = (e.clientX - dragStart.current.mouseX) / rect.width * 100

    const dyPct = (e.clientY - dragStart.current.mouseY) / rect.height * 100

    setPos({ 
      // nuova pos = origine + spostamento
      x: dragStart.current.posX + dxPct, 
      y: dragStart.current.posY + dyPct 
    })
  }

  const handlePointerUp = (e: PointerEvent<HTMLElement>) => 
  {
    if(!dragStart.current.dragging)
      return
    dragStart.current.dragging = false
    e.currentTarget.releasePointerCapture(e.pointerId)
    onMuovi(tavolo._id, pos.x, pos.y)
  }

  return (
    <div className={`tavolo-card tavolo-${tavolo.stato}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} onClick={() => onAssing(tavolo)}>
         <h2
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'grab' }}
          >
            Tavolo {tavolo.numero}
        </h2>

      <p>{tavolo.posti} posti</p>
      <p>{tavolo.stato}</p>

      <select value={tavolo.stato} onClick={(e) => e.stopPropagation()} onChange={(e) => onUpdateStato(tavolo._id, e.target.value)}>
        <option value="libero">Libero</option>
        <option value="occupato">Occupato</option>
        <option value="riservato">Riservato</option>
      </select>
      <button onClick={(e) => { e.stopPropagation(); onDelete(tavolo._id) }}>Elimina</button>
    </div>
  )
}
function App() {

  const [numero, setNumero] = useState('')
  const [posti, setPosti] = useState('')
  const [tavoli, setTavoli] = useState<Tavolo[]>([])

  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>(prenotazioniFinte)
  const [prenotazioneSelezionata, setPrenotazioneSelezionata] = useState<Prenotazione | null>(null)

  const [salaSfondo, setSalaSfondo] = useState(saleDisponibili[0].img)

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

// SEZIONE SPOSATAMENTO TAVOLI

const handleMuovi =  async (id: string, posX: number, posY: number) => {
  await fetch(`http://localhost:3000/api/tavoli/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ posX, posY })
  })
}

  return (
    <>
    <main className='alg-elements'>
      <div className='status-tavoli'>
        {/* <h1>Gestione Tavoli Ristorante</h1> */}
          <p>Tavoli Totali: {tavoli.length}</p>
          <p>Tavoli Liberi: {tavoli.filter(t => t.stato === 'libero').length}</p>
          <p>Tavoli Occupati: {tavoli.filter(t => t.stato === 'occupato').length}</p>
      </div>

      {tavoli.length === 0 && <p>nessun tavolo disponibile, creane uno nuovo</p>}

       {/* FORM PER L'AGGIUNTA DI UN NUOVO TAVOLO */}
      <form className='panel-aggiungi-tavolo' onSubmit={handleSubmit}>
        <FontAwesomeIcon icon={faPlus} />
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

    <div className="pannello-prenotazioni">
      {/* <h2>Prenotazioni</h2> */}
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
  </div>
    <select value={salaSfondo} onChange={(e) => setSalaSfondo(e.target.value)}>
      {saleDisponibili.map((sala) => (
        <option key={sala.img} value={sala.img}>{sala.nome}</option>
      ))}
    </select>
      <section className='sala' style={{ backgroundImage: `url(${salaSfondo})` }}>
        {/* <p>ecco i tavoli</p> */}
        {tavoli.map((tavolo) => (
          <TavoloCard
            key={tavolo._id}
            tavolo={tavolo}
            onDelete={handleDelete}
            onUpdateStato={handleUpdate}
            onAssing={handleAssegna}
            onMuovi={handleMuovi}
          />
        ))}
      </section>
    </main>
    </>
  )
}


export default App;
