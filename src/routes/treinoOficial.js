const express = require('express');
const router = express.Router();

const TreinoOficialController = require('../controllers/TreinoOficialController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /treinos-oficiais:
 *   post:
 *     summary: Cria um novo treino oficial
 *     tags: [TreinoOficial]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dataTreino
 *               - usuarios
 *             properties:
 *               dataTreino:
 *                 type: string
 *                 format: date
 *                 description: Data e hora do treino
 *               usuarios:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de IDs dos usuários participantes
 *               campeonato:
 *                 type: string
 *                 description: Nome do campeonato (opcional)
 *     responses:
 *       201:
 *         description: Treino oficial criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Usuário(s) não encontrado(s)
 *   get:
 *     summary: Lista todos os treinos oficiais
 *     tags: [TreinoOficial]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de treinos oficiais
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.post('/', auth, TreinoOficialController.create);
router.get('/', auth, TreinoOficialController.getAll);

/**
 * @swagger
 * /treinos-oficiais/{id}:
 *   get:
 *     summary: Busca um treino oficial por ID
 *     tags: [TreinoOficial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do treino oficial
 *     responses:
 *       200:
 *         description: Treino oficial encontrado
 *       404:
 *         description: Treino oficial não encontrado
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *   put:
 *     summary: Atualiza um treino oficial
 *     tags: [TreinoOficial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do treino oficial
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dataTreino:
 *                 type: string
 *                 format: date
 *               usuarios:
 *                 type: array
 *                 items:
 *                   type: string
 *               campeonato:
 *                 type: string
 *     responses:
 *       200:
 *         description: Treino oficial atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Treino oficial ou usuário(s) não encontrado(s)
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *   delete:
 *     summary: Exclui um treino oficial
 *     tags: [TreinoOficial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do treino oficial
 *     responses:
 *       200:
 *         description: Treino oficial excluído com sucesso
 *       404:
 *         description: Treino oficial não encontrado
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.get('/:id', auth, TreinoOficialController.getById);
router.put('/:id', auth, TreinoOficialController.update);
router.delete('/:id', auth, TreinoOficialController.delete);

module.exports = router; 