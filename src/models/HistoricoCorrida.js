const mongoose = require('mongoose');

const HistoricoCorridaSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    liga: { type: String, required: true, maxlength: 200 },
    etapa: { type: Number, required: true },
    pista: { type: String, required: true, maxlength: 250 },
    grid: { type: String, required: true, maxlength: 100 },
    simulador: { type: String, required: true },
    posicaoLargada: { type: Number, required: true },
    posicaoChegada: { type: Number, required: true },
    vmr: { type: Boolean, required: true },
    pontuacao: { type: Number, required: true },
    dataCorrida: { type: Date, required: true },
    linkTransmissao: { type: String, required: false, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    usuarioEdicaoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
});

const HistoricoCorrida = mongoose.model('HistoricoCorrida', HistoricoCorridaSchema);

module.exports = {
    HistoricoCorrida,
    HistoricoCorridaSchema
};