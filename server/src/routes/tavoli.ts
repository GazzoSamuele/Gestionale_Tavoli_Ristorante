import { Router } from 'express'
import Tavolo from '../models/Tavolo'

const router = Router()

// GET /api/tavoli  → tutti i tavoli
router.get('/', async (req, res) => {
  const tavoli = await Tavolo.find()
  res.json(tavoli)
})

export default router