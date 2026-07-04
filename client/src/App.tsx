import { useState, useEffect, type SubmitEvent } from 'react';

import './App.css'

// CRUD PER LEGGERE I TAVOLI
interface Tavolo {
  _id: string;
  numero: number;
  posti: number;
  stato: 'libero' | 'occupato' | 'riservato';
  oraArrivo?: string; 
}

function App() {

  const [numero, setNumero] = useState('')
  const [posti, setPosti] = useState('')
  // questa scatola conterrà un array di Tavolo
  const [tavoli, setTavoli] = useState<Tavolo[]>([])

  useEffect(() => {
  fetch('http://localhost:3000/api/tavoli')
    .then(res => res.json())
    .then(data => setTavoli(data))
    .catch(err => console.error(err))
}, [])

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

  return (
    <>
      <div>
        <h1>Gestione Tavoli Ristorante</h1>
      </div>

       {/* FORM PER L'AGGIUNTA DI UN NUOVO TAVOLO */}
      <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Numero"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />
      <input
        type="number"
        placeholder="Posti"
        value={posti}
        onChange={(e) => setPosti(e.target.value)}
      />
      <button type="submit">Aggiungi tavolo</button>
    </form>

      <section>
        <p>ecco i tavoli</p>
        {tavoli.map((tavolo) => (
          <li key={tavolo._id}>
            Il tavolo numero {tavolo.numero} con prenotati {tavolo.posti} posti è in stato: {tavolo.stato}
            <button onClick={() => handleDelete(tavolo._id)}>Elimina</button>
              <select value={tavolo.stato} onChange={(e) => handleUpdate(tavolo._id, e.target.value)}>
                <option value="libero">Libero</option>
                <option value="occupato">Occupato</option>
                <option value="riservato">Riservato</option>
              </select>
          </li>
        ))}
      </section>
    </>
  )
}


export default App;
