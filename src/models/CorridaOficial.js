const mongoose = require('mongoose');

const CorridaOficialSchema = new mongoose.Schema({
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
    dataCorrida: { 
        type: Date, 
        required: true 
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
    competicao: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Competicao', 
        required: true 
    }
});

// Middleware para atualizar dataAlteracao automaticamente
CorridaOficialSchema.pre('save', function(next) {
    this.dataAlteracao = new Date();
    next();
});

CorridaOficialSchema.pre('findOneAndUpdate', function(next) {
    this.set({ dataAlteracao: new Date() });
    next();
});

// Índices para melhor performance nas consultas
CorridaOficialSchema.index({ dataCorrida: -1 });
CorridaOficialSchema.index({ usuarios: 1 });
CorridaOficialSchema.index({ competicao: 1 });
CorridaOficialSchema.index({ usuarioRegistroId: 1 });

const CorridaOficial = mongoose.model('CorridaOficial', CorridaOficialSchema);

module.exports = {
    CorridaOficial,
    CorridaOficialSchema
}; 