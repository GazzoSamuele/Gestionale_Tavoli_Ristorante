import mongoose from "mongoose";

// dichiara la forma. La I davanti è una convenzione (sta per Interface)

// CRUD
interface ITavolo {
  numero: number;
  posti: number;
  stato: 'libero' | 'occupato' | 'riservato';
  oraArrivo?: Date; 
  
}

const tavoloSchema = new mongoose.Schema<ITavolo>({
    numero: { type: Number, required: true, unique: true },
    posti: { type: Number, required: true },
    stato: {
        type: String,
        enum: ['libero', 'occupato', 'riservato'],
        default: 'libero',
        required: true
    },
    oraArrivo: { type: Date }
});

const Tavolo = mongoose.model<ITavolo>('Tavolo', tavoloSchema);

export default Tavolo;