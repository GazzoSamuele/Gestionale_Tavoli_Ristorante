import mongoose from "mongoose";

interface IPrenotazione {
    nome: string;
    persone: number;
    ora: string;
    telefono: string;
    note?: string;
    stato: 'Confermato' | 'Richiesta Conferma';
    tavoloId?: mongoose.Types.ObjectId | null;
    data?: string;
    whatsappInviato: boolean;
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
    tavoloId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tavolo',
        default: null
    },
    data: { type: String },
    whatsappInviato: { type: Boolean, default: false },
});

const Prenotazione = mongoose.model<IPrenotazione>('Prenotazione', prenotazioneSchema);

export default Prenotazione;
