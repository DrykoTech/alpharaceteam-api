const mongoose = require('mongoose');

const FilaEmailSchema = new mongoose.Schema({
    destinatario: { 
        type: String, 
        required: true,
        trim: true,
        lowercase: true
    },
    assunto: { 
        type: String, 
        required: true,
        trim: true
    },
    conteudo: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pendente', 'Enviado', 'Erro', 'Cancelado'],
        default: 'Pendente'
    },
    tentativas: { 
        type: Number, 
        default: 0,
        min: 0
    },
    maxTentativas: {
        type: Number,
        default: 3,
        min: 1
    },
    dataCriacao: { 
        type: Date, 
        default: Date.now 
    },
    dataEnvio: { 
        type: Date 
    },
    proximaTentativa: {
        type: Date
    },
    erro: { 
        type: String 
    },
    templateId: { 
        type: String 
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    prioridade: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    }
}, {
    timestamps: true
});

// Índices para otimizar consultas
FilaEmailSchema.index({ status: 1, proximaTentativa: 1 });
FilaEmailSchema.index({ destinatario: 1 });
FilaEmailSchema.index({ dataCriacao: -1 });
FilaEmailSchema.index({ prioridade: -1, dataCriacao: 1 });

// Método para marcar como enviado
FilaEmailSchema.methods.marcarEnviado = function() {
    this.status = 'Enviado';
    this.dataEnvio = new Date();
    this.erro = null;
    return this.save();
};

// Método para marcar erro
FilaEmailSchema.methods.marcarErro = function(erro, proximaTentativa = null) {
    this.tentativas += 1;
    this.erro = erro;
    
    if (this.tentativas >= this.maxTentativas) {
        this.status = 'Erro';
    } else {
        this.status = 'Pendente';
        this.proximaTentativa = proximaTentativa || new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
    }
    
    return this.save();
};

// Método estático para buscar e-mails pendentes
FilaEmailSchema.statics.buscarPendentes = function(limite = 10) {
    return this.find({
        status: 'Pendente',
        $or: [
            { proximaTentativa: { $exists: false } },
            { proximaTentativa: { $lte: new Date() } }
        ],
        tentativas: { $lt: 3 }
    })
    .sort({ prioridade: -1, dataCriacao: 1 })
    .limit(limite);
};

module.exports = mongoose.model('FilaEmail', FilaEmailSchema); 