const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const { emailRateLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza o login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Email ou PSN ID do usuário
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Dados de login inválidos
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /auth/recuperar-senha:
 *   post:
 *     summary: Solicita recuperação de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário para recuperação de senha
 *     responses:
 *       200:
 *         description: E-mail de recuperação enviado (se existir)
 *       400:
 *         description: Email é obrigatório
 */
router.post('/recuperar-senha', emailRateLimiter, AuthController.solicitarRecuperacaoSenha);

/**
 * @swagger
 * /auth/redefinir-senha:
 *   post:
 *     summary: Redefine a senha usando token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               novaSenha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post('/redefinir-senha', AuthController.redefinirSenha);

module.exports = router; 