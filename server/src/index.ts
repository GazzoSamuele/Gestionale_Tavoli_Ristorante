import 'dotenv/config';

import cors from 'cors';
import tavoliRouter from './routes/tavoli';
import prenotazioniRouter from './routes/prenotazioni';
import Tavolo from './models/Tavolo'
import Prenotazione from './models/Prenotazione';
import express from 'express';
import mongoose from 'mongoose';    

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI manca nel file .env')
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connesso a MongoDB ✅'))
  .catch((err) => console.error('Errore connessione MongoDB:', err))

const app = express();
// così facendo, tutte le richieste verranno accettate
app.use(cors())
// per ogni richiesta in arrivo, se ha un corpo JSON, leggilo e mettimelo a disposizione in req.body
app.use(express.json())
// tutte le rotte del tavoliRouter partono da /api/tavoli
app.use('/api/tavoli', tavoliRouter)
// tutte le rotte del prenotazioniRouter partono da /api/prenotazioni
app.use('/api/prenotazioni', prenotazioniRouter)

// Render (e ogni hosting) assegna la porta tramite process.env.PORT. Con || 3000, in locale usa 3000, online usa quella di Render.
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {    
  res.send('benvenuti sul mio gestionale di tavoli')
})

app.listen(PORT, () => {
  console.log(`Server pronto su http://localhost:${PORT}`)
})