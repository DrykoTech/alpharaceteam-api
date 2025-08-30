const express = require('express');
const router = express.Router();
const FilaEmailController = require('../controllers/FilaEmailController');
const auth = require('../middleware/auth');

// Middleware para verificar se o usuário é admin
const verificarAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.perfil === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas administradores podem acessar este recurso.',
            data: null
        });
    }
};

/**
 * @swagger
 * tags:
 *   name: FilaEmail
 *   description: Gerenciamento da fila de e-mails
 */

/**
 * @swagger
 * /fila-email/estatisticas:
 *   get:
 *     summary: Obtém estatísticas da fila de e-mails
 *     tags: [FilaEmail]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 */

/**
 * @swagger
 * /fila-email/logs:
 *   get:
 *     summary: Obtém logs recentes de processamento de e-mails
 *     tags: [FilaEmail]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Quantidade máxima de logs a retornar
 *     responses:
 *       200:
 *         description: Logs obtidos com sucesso
 */

/**
 * @swagger
 * /fila-email/emails:
 *   get:
 *     summary: Lista e-mails da fila com paginação e filtros
 *     tags: [FilaEmail]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *         description: Página da listagem
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Quantidade por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pendente, Enviado, Erro, Cancelado]
 *         description: Filtrar por status
 *       - in: query
 *         name: destinatario
 *         schema:
 *           type: string
 *         description: Filtrar por e-mail do destinatário
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: E-mails listados com sucesso
 */

/**
 * @swagger
 * /fila-email/emails/{id}:
 *   get:
 *     summary: Obtém detalhes de um e-mail específico da fila
 *     tags: [FilaEmail]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do e-mail
 *     responses:
 *       200:
 *         description: E-mail obtido com sucesso
 *       404:
 *         description: E-mail não encontrado
 */

/**
 * @swagger
 * /fila-email/emails/{id}/reprocessar:
 *   post:
 *     summary: Marca um e-mail para reprocessamento
 *     tags: [FilaEmail]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do e-mail
 *     responses:
 *       200:
 *         description: E-mail marcado para reprocessamento
 *       404:
 *         description: E-mail não encontrado
 */

/**
 * @swagger
 * /fila-email/emails/{id}/cancelar:
 *   delete:
 *     summary: Cancela um e-mail pendente da fila
 *     tags: [FilaEmail]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do e-mail
 *     responses:
 *       200:
 *         description: E-mail cancelado com sucesso
 *       404:
 *         description: E-mail não encontrado
 */

/**
 * @swagger
 * /fila-email/processar:
 *   post:
 *     summary: Força o processamento da fila de e-mails (admin)
 *     tags: [FilaEmail]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Processamento da fila iniciado
 */

/**
 * @swagger
 * /fila-email/limpar:
 *   post:
 *     summary: Limpa e-mails antigos da fila
 *     tags: [FilaEmail]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dias:
 *                 type: integer
 *                 description: Limite de dias para limpeza (padrão: 30)
 *     responses:
 *       200:
 *         description: Limpeza concluída com sucesso
 */

/**
 * @swagger
 * /fila-email/processar-publico:
 *   post:
 *     summary: Processa a fila de e-mails (público, para uso por cron jobs)
 *     tags: [FilaEmail]
 *     responses:
 *       200:
 *         description: Processamento da fila iniciado
 */
// Rota pública para processamento (pode ser chamada por serviços externos)
router.post('/processar-publico', FilaEmailController.processarFila);

// Rotas públicas (apenas autenticação)
router.get('/estatisticas', auth, verificarAdmin, FilaEmailController.obterEstatisticas);
router.get('/logs', auth, verificarAdmin, FilaEmailController.obterLogsProcessamento);

// Rotas de gerenciamento (apenas admin)
router.get('/emails', auth, verificarAdmin, FilaEmailController.listarEmails);
router.get('/emails/:id', auth, verificarAdmin, FilaEmailController.obterEmail);
router.post('/emails/:id/reprocessar', auth, verificarAdmin, FilaEmailController.reprocessarEmail);
router.delete('/emails/:id/cancelar', auth, verificarAdmin, FilaEmailController.cancelarEmail);
router.post('/processar', auth, verificarAdmin, FilaEmailController.processarFila);
router.post('/limpar', auth, verificarAdmin, FilaEmailController.limparEmailsAntigos);

module.exports = router; 