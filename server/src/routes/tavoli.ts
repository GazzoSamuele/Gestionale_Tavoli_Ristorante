import { Router } from 'express'
import Tavolo from '../models/Tavolo'
import { error } from 'node:console'

const router = Router()

// CREZIONE DELLE CRUD

// GET (LETTURA)
router.get('/', async (req, res) => {
  const tavoli = await Tavolo.find()
  res.json(tavoli)
})

// POST (AGGIUNTA)
router.post('/', async (req, res) => {
  try {
    const nuovoTavolo = await Tavolo.create(req.body)
    res.status(201).json(nuovoTavolo)
    // Se il client manda dati che violano le regole — es. un numero mancante 
    // (required), o un numero duplicato (unique), o uno stato non nell'enum — Mongoose lancia un errore.
  } catch(err) {
    res.status(400).json({ error : "Dati del tavolo non validi" })
  }
})

// PUT (MODIFICA)
router.put('/:id', async (req,res) => {
  try{
    const modificaTavolo = await Tavolo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if(!modificaTavolo) {
      return res.status(404).json({ error: 'Tavolo non trovato'})
    }
    res.status(200).json(modificaTavolo)
  } catch (err) {
    res.status(400).json({ error: 'Richiesta non valida'})
  }
})

// DELETE (ELIMINA)
router.delete('/:id', async (req, res) => {
  try{
    const eliminaTavolo = await Tavolo.findByIdAndDelete(req.params.id)
    if (!eliminaTavolo) {
      return res.status(404).json({ error: 'Tavolo non trovato'})
    }
    res.status(200).json({ message: 'Tavolo eliminato' })
  } catch (err) {
    res.status(400).json({ error: 'ID non valido'})
  }
})
export default router