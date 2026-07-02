import 'dotenv/config'

import Tavolo from './models/Tavolo'
import express from 'express';
import mongoose from 'mongoose';    

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI manca nel file .env')
}

console.log('DEBUG inizio URI:', JSON.stringify(MONGODB_URI.slice(0, 18)))

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connesso a MongoDB ✅')
    const nuovoTavolo = await Tavolo.create({ numero: 1, posti: 4 })

    // Tavolo.create salva un tavolo nel DB; è un'operazione lenta 
    // (viaggio fino al cloud), e await dice "aspetta che finisca prima di continuare"

    console.log('Tavolo creato:', nuovoTavolo)
  })
  .catch((err) => console.error('Errore connessione MongoDB:', err))

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('benvenuti sul mio gestionale di tavoli')
})

app.listen(PORT, () => {
  console.log(`Server pronto su http://localhost:${PORT}`)
})