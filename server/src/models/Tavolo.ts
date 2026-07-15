import mongoose from "mongoose";

// dichiara la forma. La I davanti è una convenzione (sta per Interface)
interface ITavolo {
    numero: number;
    posti: number;
    stato: 'libero' | 'occupato' | 'riservato';
    oraArrivo?: Date;
    
    posX: number;
    posY: number;

    sala: string;
}

const tavoloSchema = new mongoose.Schema<ITavolo>({
    numero: { type: Number, required: true },
    posti: { type: Number, required: true },
    stato: {
        type: String,
        enum: ['libero', 'occupato', 'riservato'],
        default: 'libero',
        required: true
    },
    oraArrivo: { type: Date },

    posX: { type: Number, default: 0 },
    posY: { type: Number, default: 0 },

    sala: { type: String, required: true},
});

tavoloSchema.index({ numero: 1, sala: 1 }, { unique: true })

const Tavolo = mongoose.model<ITavolo>('Tavolo', tavoloSchema);

export default Tavolo;