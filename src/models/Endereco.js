const mongoose = require('mongoose');

const EnderecoSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    rua: { type: String, required: true },
    numero: { type: Number, required: true },
    bairro: { type: String, required: true },
    cidade: { type: String, required: true },
    estado: { type: String, required: true },
    cep: { type: String, required: true, maxlength: 8 },
    pais: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    usuarioEdicaoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
});

const Endereco = mongoose.model('Endereco', EnderecoSchema);

module.exports = {
    Endereco,
    EnderecoSchema
};