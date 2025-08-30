const express = require('express');
const router = express.Router();

const CorridaOficialController = require('../controllers/CorridaOficialController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /corridas-oficiais:
 *   post:
 *     summary: Cria uma nova corrida oficial
 *     tags: [CorridaOficial]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dataCorrida
 *               - usuarios
 *               - competicao
 *             properties:
 *               dataCorrida:
 *                 type: string
 *                 format: date
 *                 description: Data e hora da corrida
 *               usuarios:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de IDs dos usuários participantes
 *               competicao:
 *                 type: string
 *                 description: ID da competição
 *     responses:
 *       201:
 *         description: Corrida oficial criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Usuário(s) ou competição não encontrado(s)
 *   get:
 *     summary: Lista todas as corridas oficiais
 *     tags: [CorridaOficial]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de corridas oficiais
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.post('/', auth, CorridaOficialController.create);
router.get('/', auth, CorridaOficialController.getAll);

/**
 * @swagger
 * /corridas-oficiais/{id}:
 *   get:
 *     summary: Busca uma corrida oficial por ID
 *     tags: [CorridaOficial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da corrida oficial
 *     responses:
 *       200:
 *         description: Corrida oficial encontrada
 *       404:
 *         description: Corrida oficial não encontrada
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *   put:
 *     summary: Atualiza uma corrida oficial
 *     tags: [CorridaOficial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da corrida oficial
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dataCorrida:
 *                 type: string
 *                 format: date
 *               usuarios:
 *                 type: array
 *                 items:
 *                   type: string
 *               competicao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Corrida oficial atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Corrida oficial, usuário(s) ou competição não encontrado(s)
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *   delete:
 *     summary: Exclui uma corrida oficial
 *     tags: [CorridaOficial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da corrida oficial
 *     responses:
 *       200:
 *         description: Corrida oficial excluída com sucesso
 *       404:
 *         description: Corrida oficial não encontrada
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.get('/:id', auth, CorridaOficialController.getById);
router.put('/:id', auth, CorridaOficialController.update);
router.delete('/:id', auth, CorridaOficialController.delete);

module.exports = router; 