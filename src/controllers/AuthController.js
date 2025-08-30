const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ApiResponse = require('../models/ApiResponse');
const { enviarEmailRecuperacaoSenha } = require('../config/emailService');

const SECRET = process.env.JWT_SECRET;

const AuthController = {
    async login(req, res) {
        try {
            const { username, senha } = req.body;

            const usuario = await Usuario.findOne({
                $or: [{ email: username }, { psnId: username }]
            });

            if (!usuario) {
                return res.status(401).json(new ApiResponse(false, 'Dados de login inválidos'));
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                return res.status(401).json(new ApiResponse(false, 'Dados de login inválidos'));
            }

            const token = jwt.sign(
                {
                    id: usuario._id,
                    nome: usuario.nome,
                    psnId: usuario.psnId,
                    fotoPerfil: usuario.fotoPerfil,
                    nivel: usuario.nivel,
                    perfil: usuario.perfil,
                    email: usuario.email,
                },
                SECRET,
                { expiresIn: '7d' }
            );

            const usuarioSemSenha = usuario.toObject();
            delete usuarioSemSenha.senha;
            return res.status(200).json(new ApiResponse(true, 'Login realizado com sucesso', { token, usuario: usuarioSemSenha }));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro interno ao realizar login', null, { error: err.message }));
        }
    },

    async solicitarRecuperacaoSenha(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json(new ApiResponse(false, 'Email é obrigatório'));
            }

            const usuario = await Usuario.findOne({ email });

            if (!usuario) {
                // Por segurança, não informamos se o e-mail existe ou não
                return res.status(200).json(new ApiResponse(true, 'Se o e-mail existir, você receberá instruções de recuperação'));
            }

            // Gerar token de recuperação (expira em 1 hora)
            const token = crypto.randomBytes(32).toString('hex');
            const tokenExpira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

            // Salvar token no usuário (você pode criar um campo para isso)
            usuario.tokenRecuperacao = token;
            usuario.tokenRecuperacaoExpira = tokenExpira;
            await usuario.save();

            // Enviar e-mail de recuperação
            try {
                await enviarEmailRecuperacaoSenha({
                    nome: usuario.nome,
                    email: usuario.email,
                    token: token
                });
            } catch (emailError) {
                console.error('Erro ao enviar e-mail de recuperação:', emailError);
                return res.status(500).json(new ApiResponse(false, 'Erro ao enviar e-mail de recuperação'));
            }

            return res.status(200).json(new ApiResponse(true, 'Se o e-mail existir, você receberá instruções de recuperação'));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro interno ao solicitar recuperação', null, { error: err.message }));
        }
    },

    async redefinirSenha(req, res) {
        try {
            const { token, novaSenha } = req.body;

            if (!token || !novaSenha) {
                return res.status(400).json(new ApiResponse(false, 'Token e nova senha são obrigatórios'));
            }

            const usuario = await Usuario.findOne({
                tokenRecuperacao: token,
                tokenRecuperacaoExpira: { $gt: new Date() }
            });

            if (!usuario) {
                return res.status(400).json(new ApiResponse(false, 'Token inválido ou expirado'));
            }

            // Atualizar senha
            const hashedPassword = await bcrypt.hash(novaSenha, 10);
            usuario.senha = hashedPassword;
            usuario.tokenRecuperacao = null;
            usuario.tokenRecuperacaoExpira = null;
            await usuario.save();

            return res.status(200).json(new ApiResponse(true, 'Senha redefinida com sucesso'));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro interno ao redefinir senha', null, { error: err.message }));
        }
    }
};

module.exports = AuthController; 