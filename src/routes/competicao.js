const express = require('express');
const router = express.Router();

const CompeticaoController = require('../controllers/CompeticaoController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /competicoes:
 *   post:
 *     summary: Cria uma nova competição
 *     tags: [Competição]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - dataInicio
 *               - grids
 *               - campeonatos
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome da competição
 *               dataInicio:
 *                 type: string
 *                 format: date
 *                 description: Data de início da competição
 *               grids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de grids disponíveis
 *               campeonatos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de campeonatos
 *     responses:
 *       201:
 *         description: Competição criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *   get:
 *     summary: Lista todas as competições
 *     tags: [Competição]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de competições
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.post('/', auth, CompeticaoController.create);
router.get('/', auth, CompeticaoController.getAll);

/**
 * @swagger
 * /competicoes/{id}:
 *   get:
 *     summary: Busca uma competição por ID
 *     tags: [Competição]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da competição
 *     responses:
 *       200:
 *         description: Competição encontrada
 *       404:
 *         description: Competição não encontrada
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *   put:
 *     summary: Atualiza uma competição
 *     tags: [Competição]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da competição
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               dataInicio:
 *                 type: string
 *                 format: date
 *               grids:
 *                 type: array
 *                 items:
 *                   type: string
 *               campeonatos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Competição atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Competição não encontrada
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *   delete:
 *     summary: Exclui uma competição
 *     tags: [Competição]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da competição
 *     responses:
 *       200:
 *         description: Competição excluída com sucesso
 *       404:
 *         description: Competição não encontrada
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.get('/:id', auth, CompeticaoController.getById);
router.put('/:id', auth, CompeticaoController.update);
router.delete('/:id', auth, CompeticaoController.delete);

module.exports = router; 