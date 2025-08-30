const mongoose = require('mongoose');

const TreinoOficialSchema = new mongoose.Schema({
    usuarioRegistroId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    dataCadastro: { 
        type: Date, 
        default: Date.now 
    },
    dataAlteracao: { 
        type: Date, 
        default: Date.now 
    },
    dataTreino: { 
        type: Date, 
        required: true 
    },
    simulador: {
        type: String,
        default: ''
    },
    usuarios: { 
        type: [mongoose.Schema.Types.ObjectId], 
        ref: 'Usuario',
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Usuários não pode estar vazio'
        }
    },
    campeonato: { 
        type: String, 
        default: '',
        maxlength: 100
    }
});

// Middleware para atualizar dataAlteracao automaticamente
TreinoOficialSchema.pre('save', function(next) {
    this.dataAlteracao = new Date();
    next();
});

TreinoOficialSchema.pre('findOneAndUpdate', function(next) {
    this.set({ dataAlteracao: new Date() });
    next();
});

// Índices para melhor performance nas consultas
TreinoOficialSchema.index({ dataTreino: -1 });
TreinoOficialSchema.index({ usuarios: 1 });
TreinoOficialSchema.index({ usuarioRegistroId: 1 });

const TreinoOficial = mongoose.model('TreinoOficial', TreinoOficialSchema);

module.exports = {
    TreinoOficial,
    TreinoOficialSchema
}; 