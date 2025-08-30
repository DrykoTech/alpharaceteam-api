const mongoose = require('mongoose');

const FaltaSchema = new mongoose.Schema({
    // Referência genérica - pode ser Treino, HistoricoCorrida, etc.
    referenciaId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    
    // Tipo da falta - define qual entidade está sendo referenciada
    tipoFalta: { 
        type: String, 
        required: true,
        enum: ['TREINO', 'CAMPEONATO'] // Referencia TreinoOficial ou CorridaOficial
    },
    
    // Usuário que faltou
    usuarioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    
    // Tipo da justificativa
    tipo: { 
        type: String, 
        required: true,
        enum: ['JUSTIFICADA', 'NAO_JUSTIFICADA']
    },
    
    // Justificativa detalhada
    justificativa: { 
        type: String, 
        default: '',
        maxlength: 500
    },
    
    // Usuário que registrou a falta (pode ser diferente do usuário que faltou)
    usuarioRegistroId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    
    // Timestamps
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
FaltaSchema.pre('save', function(next) {
    this.dataAlteracao = new Date();
    next();
});

FaltaSchema.pre('findOneAndUpdate', function(next) {
    this.set({ dataAlteracao: new Date() });
    next();
});

// Índices para melhor performance nas consultas
FaltaSchema.index({ usuarioId: 1, tipoFalta: 1 });
FaltaSchema.index({ referenciaId: 1, tipoFalta: 1 });
FaltaSchema.index({ dataCadastro: -1 });

const Falta = mongoose.model('Falta', FaltaSchema);

module.exports = {
    Falta,
    FaltaSchema
}; 