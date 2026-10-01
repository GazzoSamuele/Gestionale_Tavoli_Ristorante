import "dotenv/config";
import { connectDB } from "./db";
import cors from "cors";
import tavoliRouter from "./routes/tavoli";
import prenotazioniRouter from "./routes/prenotazioni";
import express from "express";

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (errore) {
    console.error("❌ Database non raggiungibile:", errore);
    res
      .status(503)
      .json({ errore: "Database non raggiungibile, riprova tra poco" });
  }
});

app.use("/api/tavoli", tavoliRouter);

app.use("/api/prenotazioni", prenotazioniRouter);

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("benvenuti sul mio gestionale di tavoli");
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
  });
}

export default app;
