import mongoose from "mongoose";

interface IPrenotazione {
    nome: string;
    persone: number;
    ora: string;
    telefono: string;
    // il ? rende il valore opzionale
    note?: string;
    stato: 'Confermato' | 'Richiesta Conferma';
}

const prenotazioneSchema = new mongoose.Schema<IPrenotazione>({
    nome: { type: String, required: true },
    persone: { type: Number, required: true },
    ora: { type: String, required: true },
    telefono: { type: String, required: true },
    note: { type: String },
    stato: {
        type: String,
        enum: ['Confermato', 'Richiesta Conferma'],
        default: 'Richiesta Conferma',
        required: true
    },
});

const Prenotazione = mongoose.model<IPrenotazione>('Prenotazione', prenotazioneSchema);

export default Prenotazione;