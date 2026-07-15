import { useState, useEffect, useRef, type SubmitEvent, type PointerEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'

import './App.scss'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// INTERFACCIA TS PER LA VISUALIZZAZIONE DELL'UNITA' "PRENOTAZIONE"
interface Prenotazione {
  _id: string;
  nome: string;
  persone: number;
  ora: string;
  telefono: string;
  tavoloId?: string;
}

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
  // onUpdateStato: (id: string, nuovoStato: string) => void;
  onAssign: (tavolo: Tavolo) => void;
  onMuovi: (id: string, posX: number, posY: number) => void;
  evidenziato: boolean;
  prenotazione?: Prenotazione;
}

function TavoloCard({ tavolo, onDelete, onAssign, onMuovi, evidenziato, prenotazione }: TavoloCardProps) {

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
    <div 
      className={`tavolo-card tavolo-${tavolo.stato} ${evidenziato ? 'evidenziato' : ''}`} 
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }} 
      onClick={() => onAssign(tavolo)}>
         <h2
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'grab' }}
          >
            Tavolo {tavolo.numero}
        </h2>
    {tavolo.stato === 'occupato' && prenotazione && (
        <>
          <p>👤 {prenotazione.nome}</p>
          <p>🕐 {prenotazione.ora}</p>
        </>
      )}
      <p>{tavolo.posti} posti</p>
      <p>{tavolo.stato}</p>

      {/* <select value={tavolo.stato} onClick={(e) => e.stopPropagation()} onChange={(e) => onUpdateStato(tavolo._id, e.target.value)}>
        <option value="libero">Libero</option>
        <option value="occupato">Occupato</option>
        <option value="riservato">Riservato</option>
      </select> */}
      <button onClick={(e) => { e.stopPropagation(); onDelete(tavolo._id) }}>Elimina</button>
    </div>
  )
}
function App() {

  const [numero, setNumero] = useState('')
  const [posti, setPosti] = useState('')
  const [tavoli, setTavoli] = useState<Tavolo[]>([])

  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([])
  const [prenotazioneSelezionata, setPrenotazioneSelezionata] = useState<Prenotazione | null>(null)

  const [salaSfondo, setSalaSfondo] = useState(saleDisponibili[0].img)

  const [panelEdit, setpanelEdit] = useState(false)
  const [panelReservations, setpanelReservations] = useState(false)

  const [prenotazioniConfermate, setPrenotazioniConfermate] = useState<Prenotazione[]>([])

  const [tavoloEvidenziato, setTavoloEvidenziato] = useState<string | null>(null)

  const [prenotazioniInviate, setPrenotazioniInviate] = useState<string[]>([])

  useEffect(() => {
  fetch(`${API_URL}/api/tavoli`)
    .then(res => res.json())
    .then(data => setTavoli(data))
    .catch(err => console.error(err))
}, [])

  useEffect(() => {
  fetch('http://localhost:3000/api/prenotazioni')
    .then(res => res.json())
    .then(data => setPrenotazioni(data))
    .catch(err => console.error(err))
}, [])

// SEZIONE TAVOLI (RICHIAMO OPERAZIONI CRUD)

// AGGIUNGI 
const handleSubmit = async (e: SubmitEvent) => {
  e.preventDefault()

  const res = await fetch(`${API_URL}/api/tavoli`, {
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
    fetch(`${API_URL}/api/tavoli/${id}`, {
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
  const res = await fetch(`${API_URL}/api/tavoli/${id}`, {
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
  setPrenotazioni(prenotazioni.filter((p) => p._id !== prenotazioneSelezionata._id))

  // spostamento delle prenotazioni confermate
  setPrenotazioniConfermate([...prenotazioniConfermate, {...prenotazioneSelezionata, tavoloId: tavolo._id }])

   // deseleziona
  setPrenotazioneSelezionata(null)
}

// SEZIONE SPOSATAMENTO TAVOLI

const handleMuovi =  async (id: string, posX: number, posY: number) => {
  await fetch(`${API_URL}/api/tavoli/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ posX, posY })
  })
}

// FUNZIONE CHE INVIA IL MESSAGGIO SU WHATSAPP ALLA PRENOTAZIONE CONFERMATA

const inviaWhatsApp = (pren: Prenotazione) => {
  const messaggio = `Ciao ${pren.nome}! 🍽️ La tua prenotazione per ${pren.persone} persone alle ${pren.ora} è confermata. Ti aspettiamo!`

  const url = 
  // "codifica" il messaggio per l'URL senza spazi, emoji o accenti
  `https://wa.me/${pren.telefono}?text=${encodeURIComponent(messaggio)}`
  
  window.open(url, '_blank')

  // MESSAGGIO NELLE PRENOTAZIONI CONFERMATE CHE INDICA L'INVIO DEL MESSAGGIO SU WHATSAPP AL CLIENTE
  setPrenotazioniInviate([...prenotazioniInviate, pren._id])
}

  return (
    <>
    <main className='layout-sala'>

    <div className='prenotazioni-confermate-and-sala'>
  {/* PANNELLO PER LA VISUALIZZAZIONE DI TUTTE LE PRENOTAZIONI CONFERMATE */}
    <div className='panel-prenotazioni-confermate'>
      <button className="toggle-panel-edit toggle-panel-bookings" onClick={() => setpanelReservations(!panelReservations)}>
        <FontAwesomeIcon icon={panelReservations ? faXmark : faPlus} />
      </button>
    
      {panelReservations && (
        <>
        <div className="prenotazioni-only-whatsapp">
            {prenotazioniConfermate.slice(0, 4).map((pren) => (
              <div
                key={pren._id}
                className="prenotazione-card"
                onClick={() => setTavoloEvidenziato(pren.tavoloId ?? null)}
                >
                  <strong>{pren.nome}</strong>
                  <p>{pren.persone} persone</p>
                  <p>ore {pren.ora}</p>
                  <p>Tavolo {tavoli.find(t => t._id === pren.tavoloId)?.numero}</p>

              {prenotazioniInviate.includes(pren._id)
                ? <p>✅ WhatsApp Inviato</p>
                : <button onClick={(e) => { e.stopPropagation(); inviaWhatsApp(pren) }}>Conferma via WhatsApp</button>
                }
              </div>
            ))}
          </div>
          </>
        )} 
      </div>    

      <section className='sala' style={{ backgroundImage: `url(${salaSfondo})` }}>
        {tavoli.map((tavolo) => {
          const prenotazione = prenotazioniConfermate.find(p => p.tavoloId === tavolo._id)
          return (
          <TavoloCard
            key={tavolo._id}
            tavolo={tavolo}
            prenotazione={prenotazione}
            onDelete={handleDelete}
            // onUpdateStato={handleUpdate}
            onAssign={handleAssegna}
            onMuovi={handleMuovi}
            evidenziato={tavolo._id === tavoloEvidenziato}
          />
          )
        })}
      </section>
    </div>

      <section className='panels'>
    {/* PANNELLO DI EDIT GENERALE */}
      <aside>
          <div className='btn-close-alert-tables'>
            <button className="toggle-panel-edit" onClick={() => setpanelEdit(!panelEdit)}>
            <FontAwesomeIcon icon={panelEdit ? faXmark : faPlus} />
          </button>

          <div className='table-not-avaible'>{tavoli.length === 0 && <p>nessun tavolo disponibile, creane uno nuovo</p>}</div>
          
        </div>
        {/* CAMBIO LAYOUT DELLA SALA E FORM PER L'AGGIUNTA DI UN NUOVO TAVOLO*/}
        {panelEdit && (
          <> 
          <section className='stato-tavoli-panels'>
            <div className='alg-status-span-table'>
              <div className='status-tavoli'>
                  <div className='alg-stats-totali'>
                    <p>{tavoli.length}</p>
                    <p>Totali</p>
                  </div>
                  <div className='alg-stats-liberi'>
                    <p>{tavoli.filter(t => t.stato === 'libero').length}</p>
                    <p>Liberi</p>
                  </div>
                  <div className='alg-stats-occupati'>
                    <p>{tavoli.filter(t => t.stato === 'occupato').length}</p>
                    <p>Occupati</p>
                  </div>
                </div> 
            </div>

            <div className='path-element-panel-edit'>
              <h3>Cambia il layout della sala</h3>
                <select className='panel-edit' value={salaSfondo} onChange={(e) => setSalaSfondo(e.target.value)}>
                {saleDisponibili.map((sala) => (
                  <option key={sala.img} value={sala.img}>{sala.nome}</option>
                ))}
              </select>
            </div>
        
          <div className='alg-new-table-change-layout'>    

                <div className='path-element-panel-edit'>
                  <h3>Aggiungi un nuovo tavolo</h3>
                  <form className='panel-edit' onSubmit={handleSubmit}>
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
              </div>
            </div>

          <div className="pannello-prenotazioni">
              {prenotazioni.slice(0, 6).map((pren) => (
                <div
                  key={pren._id}
                  className={`prenotazione-card ${prenotazioneSelezionata?._id === pren._id ? 'selezionata' : ''}`}
                  onClick={() => setPrenotazioneSelezionata(pren)}
                >
                  <strong>{pren.nome}</strong>
                  <p>{pren.persone} persone</p>
                  <p>ore {pren.ora}</p>

                </div>
            ))}
          </div>
          </section>
          </>
        )} 
      </aside>     
      </section>
    </main>
    </>
  )
}


export default App;

