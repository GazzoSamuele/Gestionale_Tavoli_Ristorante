import { useState, useEffect } from 'react';

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

  // questa scatola conterrà un array di Tavolo
  const [tavoli, setTavoli] = useState<Tavolo[]>([])

  useEffect(() => {
  fetch('http://localhost:3000/api/tavoli')
    .then(res => res.json())
    .then(data => setTavoli(data))
    .catch(err => console.error(err))
}, [])

  return (
    <>
      <div>
        <h1>Gestione Tavoli Ristorante</h1>
      </div>

      <section>
        <p>ecco i tavoli</p>
        {tavoli.map((tavolo) => (
          <li key={tavolo._id}>
            Tavolo {tavolo.numero} — {tavolo.posti} posti — stato: {tavolo.stato}
          </li>
        ))}
      </section>
    </>
  )
}


export default App;
