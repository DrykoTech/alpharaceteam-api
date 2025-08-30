const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    // Informações da operação
    operacao: { 
        type: String, 
        required: true, 
        enum: ['CREATE', 'UPDATE', 'DELETE'] 
    },
    entidade: { 
        type: String, 
        required: true,
        enum: ['Usuario', 'Endereco', 'HistoricoCorrida', 'Treino', 'FilaEmail', 'Falta']
    },
    entidadeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    
    // Usuário que executou a operação
    usuarioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    
    // Dados da operação
    dadosAnteriores: { 
        type: mongoose.Schema.Types.Mixed, 
        default: null 
    },
    dadosNovos: { 
        type: mongoose.Schema.Types.Mixed, 
        default: null 
    },
    
    // Informações adicionais
    ip: { 
        type: String 
    },
    userAgent: { 
        type: String 
    },
    endpoint: { 
        type: String 
    },
    metodo: { 
        type: String 
    },
    
    // Status da operação
    sucesso: { 
        type: Boolean, 
        required: true, 
        default: true 
    },
    erro: { 
        type: String 
    },
    
    // Timestamps
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Índices para melhor performance nas consultas
LogSchema.index({ entidade: 1, entidadeId: 1 });
LogSchema.index({ usuarioId: 1 });
LogSchema.index({ operacao: 1 });
LogSchema.index({ createdAt: -1 });
LogSchema.index({ sucesso: 1 });

const Log = mongoose.model('Log', LogSchema);

module.exports = {
    Log,
    LogSchema
}; 