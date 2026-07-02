import express from 'express'

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('benvenuti sul mio gestionale di tavoli')
})

app.listen(PORT, () => {
  console.log(`Server pronto su http://localhost:${PORT}`)
})