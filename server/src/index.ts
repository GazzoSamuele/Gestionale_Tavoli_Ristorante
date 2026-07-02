import 'dotenv/config';

import cors from 'cors';
import tavoliRouter from './routes/tavoli';
import Tavolo from './models/Tavolo'
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


const PORT = 3000;

app.get('/', (req, res) => {    
  res.send('benvenuti sul mio gestionale di tavoli')
})

app.listen(PORT, () => {
  console.log(`Server pronto su http://localhost:${PORT}`)
})