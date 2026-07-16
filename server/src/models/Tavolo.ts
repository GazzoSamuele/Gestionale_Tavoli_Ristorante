import mongoose from "mongoose";

interface ITavolo {
    numero: number;
    posti: number;

    posX: number;
    posY: number;

    sala: string;
}

const tavoloSchema = new mongoose.Schema<ITavolo>({
    numero: { type: Number, required: true },
    posti: { type: Number, required: true },

    posX: { type: Number, default: 0 },
    posY: { type: Number, default: 0 },

    sala: { type: String, required: true},
});

tavoloSchema.index({ numero: 1, sala: 1 }, { unique: true })

const Tavolo = mongoose.model<ITavolo>('Tavolo', tavoloSchema);

export default Tavolo;
