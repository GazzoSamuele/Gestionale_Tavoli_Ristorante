import { Router } from 'express'
import Prenotazione from '../models/Prenotazione'

const router = Router()

// CREZIONE DELLE CRUD

// GET (LETTURA)
router.get('/', async (req, res) => {
  const prenotazioni = await Prenotazione.find()
  res.json(prenotazioni)
})

// POST (AGGIUNTA)
router.post('/', async (req, res) => {
  try {
    const nuovaPrenotazione = await Prenotazione.create(req.body)
    res.status(201).json(nuovaPrenotazione)
  } catch(err) {
    res.status(400).json({ error : "Dati della prenotazione non validi" })
  }
})

// PUT (MODIFICA)
router.put('/:id', async (req,res) => {
  try{
    const modificaPrenotazione = await Prenotazione.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if(!modificaPrenotazione) {
      return res.status(404).json({ error: 'Prenotazione non trovata'})
    }
    res.status(200).json(modificaPrenotazione)
  } catch (err) {
    res.status(400).json({ error: 'Richiesta non valida'})
  }
})

// DELETE (ELIMINA)
router.delete('/:id', async (req, res) => {
  try{
    const eliminaPrenotazione = await Prenotazione.findByIdAndDelete(req.params.id)
    if (!eliminaPrenotazione) {
      return res.status(404).json({ error: 'Prenotazione non trovata'})
    }
    res.status(200).json({ message: 'Prenotazione eliminata' })
  } catch (err) {
    res.status(400).json({ error: 'ID non valido'})
  }
})
export default router