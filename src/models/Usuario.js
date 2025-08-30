const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    dataNascimento: { type: Date, required: true },
    telefone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    psnId: { type: String, required: true, unique: true },
    fotoPerfil: { type: String },
    fotoCard: { type: String },
    volante: { type: String, required: true },
    nivel: { type: String, required: true },
    perfil: { type: String, required: true },
    plataforma: { type: String, required: true },
    simulador: { type: [''], required: true },
    ativo: { type: Boolean, required: true },
    tokenRecuperacao: { type: String },
    tokenRecuperacaoExpira: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    usuarioEdicaoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);