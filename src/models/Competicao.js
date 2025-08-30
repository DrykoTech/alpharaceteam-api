const mongoose = require('mongoose');

const CompeticaoSchema = new mongoose.Schema({
    nome: { 
        type: String, 
        required: true,
        maxlength: 100
    },
    dataInicio: { 
        type: Date, 
        required: true 
    },
    grids: { 
        type: [String], 
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Grids não pode estar vazio'
        }
    },
    campeonatos: { 
        type: [String], 
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Campeonatos não pode estar vazio'
        }
    },
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
    }
});

// Middleware para atualizar dataAlteracao automaticamente
CompeticaoSchema.pre('save', function(next) {
    this.dataAlteracao = new Date();
    next();
});

CompeticaoSchema.pre('findOneAndUpdate', function(next) {
    this.set({ dataAlteracao: new Date() });
    next();
});

// Índices para melhor performance nas consultas
CompeticaoSchema.index({ nome: 1 });
CompeticaoSchema.index({ dataInicio: -1 });
CompeticaoSchema.index({ usuarioRegistroId: 1 });

const Competicao = mongoose.model('Competicao', CompeticaoSchema);

module.exports = {
    Competicao,
    CompeticaoSchema
}; 