const express = require('express');
const router = express.Router();

const FaltaController = require('../controllers/FaltaController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Falta:
 *       type: object
 *       required:
 *         - referenciaId
 *         - tipoFalta
 *         - usuarioId
 *         - tipo
 *       properties:
 *         referenciaId:
 *           type: string
 *           description: ID da referência (Treino, HistoricoCorrida, etc.)
 *         tipoFalta:
 *           type: string
 *           enum: [TREINO, CAMPEONATO, REUNIAO, EVENTO]
 *           description: Tipo da falta
 *         usuarioId:
 *           type: string
 *           description: ID do usuário que faltou
 *         tipo:
 *           type: string
 *           enum: [JUSTIFICADA, NAO_JUSTIFICADA]
 *           description: Tipo da justificativa
 *         justificativa:
 *           type: string
 *           maxLength: 500
 *           description: Justificativa detalhada da falta
 *       example:
 *         referenciaId: "665f1b2c2c8b2c001f7e4a1a"
 *         tipoFalta: "TREINO"
 *         usuarioId: "665f1b2c2c8b2c001f7e4a1b"
 *         tipo: "JUSTIFICADA"
 *         justificativa: "Problema de saúde"
 */

/**
 * @swagger
 * /faltas:
 *   get:
 *     summary: Lista todas as faltas com paginação e filtros
 *     description: Retorna uma lista paginada de faltas com opções de filtro
 *     tags: [Falta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Quantidade de registros por página (máximo 100)
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do usuário
 *       - in: query
 *         name: tipoFalta
 *         schema:
 *           type: string
 *           enum: [TREINO, CAMPEONATO, REUNIAO, EVENTO]
 *         description: Filtrar por tipo de falta
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [JUSTIFICADA, NAO_JUSTIFICADA]
 *         description: Filtrar por tipo de justificativa
 *     responses:
 *       200:
 *         description: Lista de faltas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     faltas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Falta'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *                         nextPage:
 *                           type: integer
 *                           nullable: true
 *                         prevPage:
 *                           type: integer
 *                           nullable: true
 *       400:
 *         description: Parâmetros de paginação inválidos
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       500:
 *         description: Erro interno do servidor
 *   post:
 *     summary: Registra uma nova falta
 *     tags: [Falta]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Falta'
 *     responses:
 *       201:
 *         description: Falta registrada com sucesso
 *       400:
 *         description: Dados inválidos ou referência não encontrada
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.post('/', FaltaController.create);
router.get('/', FaltaController.getAll);

/**
 * @swagger
 * /faltas/usuario/{usuarioId}:
 *   get:
 *     summary: Lista todas as faltas de um usuário específico
 *     tags: [Falta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *       - in: query
 *         name: tipoFalta
 *         schema:
 *           type: string
 *           enum: [TREINO, CAMPEONATO, REUNIAO, EVENTO]
 *         description: Filtrar por tipo de falta
 *     responses:
 *       200:
 *         description: Lista de faltas do usuário
 *       400:
 *         description: ID do usuário não fornecido
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.get('/usuario/:usuarioId', FaltaController.getByUsuario);

/**
 * @swagger
 * /faltas/referencia/{tipoFalta}/{referenciaId}:
 *   get:
 *     summary: Lista todas as faltas de uma referência específica
 *     tags: [Falta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipoFalta
 *         required: true
 *         schema:
 *           type: string
 *           enum: [TREINO, CAMPEONATO, REUNIAO, EVENTO]
 *         description: Tipo da falta
 *       - in: path
 *         name: referenciaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da referência
 *     responses:
 *       200:
 *         description: Lista de faltas da referência
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.get('/referencia/:tipoFalta/:referenciaId', FaltaController.getByReferencia);

/**
 * @swagger
 * /faltas/{id}:
 *   get:
 *     summary: Busca uma falta por ID
 *     tags: [Falta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Falta encontrada
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Falta não encontrada
 *   put:
 *     summary: Atualiza uma falta por ID
 *     tags: [Falta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [JUSTIFICADA, NAO_JUSTIFICADA]
 *               justificativa:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Falta atualizada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Falta não encontrada
 *   delete:
 *     summary: Deleta uma falta por ID
 *     tags: [Falta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Falta deletada
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Falta não encontrada
 */
router.get('/:id', FaltaController.getById);
router.put('/:id', FaltaController.update);
router.delete('/:id', FaltaController.delete);

module.exports = router; 