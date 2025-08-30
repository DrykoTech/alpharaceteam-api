const mongoose = require('mongoose');

const TreinoSchema = new mongoose.Schema({
    usuarioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    campeonato: { 
        type: String, 
        required: true, 
        maxlength: 150 
    },
    pista: { 
        type: String, 
        required: true, 
        maxlength: 250 
    },
    melhorVolta: { 
        type: String, 
        required: true 
    },
    participacao: { 
        type: Boolean, 
        default: true 
    },
    vitoria: { 
        type: Boolean, 
        required: true 
    },
    simulador: { 
        type: String, 
        required: true,
        trim: true
    },
    dataTreino: { 
        type: Date, 
        required: true 
    },
    desistencia: {
        type: Boolean,
        default: false
    },
    dataCadastro: { 
        type: Date, 
        default: Date.now 
    },
    dataAlteracao: { 
        type: Date, 
        default: Date.now 
    },
    usuarioEdicaoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario' 
    }
});

// Middleware para atualizar dataAlteracao automaticamente
TreinoSchema.pre('save', function(next) {
    // Só atualiza se não foi definido manualmente
    if (!this.dataAlteracao) {
        this.dataAlteracao = new Date();
    }
    next();
});

TreinoSchema.pre('findOneAndUpdate', function(next) {
    // Só atualiza se não foi definido manualmente
    if (!this._update.dataAlteracao) {
        this.set({ dataAlteracao: new Date() });
    }
    next();
});

const Treino = mongoose.model('Treino', TreinoSchema);

module.exports = {
    Treino,
    TreinoSchema
}; 