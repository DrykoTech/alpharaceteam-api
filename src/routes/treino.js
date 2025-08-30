const express = require('express');
const router = express.Router();
const TreinoController = require('../controllers/TreinoController');

/**
 * @swagger
 * /treinos:
 *   get:
 *     summary: Lista todos os treinos com paginação e filtros
 *     description: Retorna uma lista paginada de treinos com opções de filtro
 *     tags: [Treino]
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
 *         name: simulador
 *         schema:
 *           type: string
 *         description: Filtrar por simulador (busca case-insensitive)
 *       - in: query
 *         name: pista
 *         schema:
 *           type: string
 *         description: Filtrar por pista (busca case-insensitive)
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: Filtrar por nome do usuário (busca case-insensitive)
 *       - in: query
 *         name: psnId
 *         schema:
 *           type: string
 *         description: Filtrar por PSN ID do usuário (busca case-insensitive)
 *     responses:
 *       200:
 *         description: Lista de treinos retornada com sucesso
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
 *                     treinos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           usuarioId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               nome:
 *                                 type: string
 *                               psnId:
 *                                 type: string
 *                           campeonato:
 *                             type: string
 *                           pista:
 *                             type: string
 *                           melhorVolta:
 *                             type: string
 *                           participacao:
 *                             type: boolean
 *                           vitoria:
 *                             type: boolean
 *                           simulador:
 *                             type: string
 *                           desistencia:
 *                             type: boolean
 *                             description: Indica se houve desistência no treino
 *                           dataTreino:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
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
 *     summary: Cria um novo treino
 *     tags: [Treino]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Treino'
 *     responses:
 *       201:
 *         description: Treino criado com sucesso
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.post('/', TreinoController.create);
router.get('/', TreinoController.getAll);

/**
 * @swagger
 * /treinos/{id}:
 *   get:
 *     summary: Busca um treino pelo ID
 *     tags: [Treino]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do treino
 *     responses:
 *       200:
 *         description: Treino encontrado
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Treino não encontrado
 *   put:
 *     summary: Atualiza um treino pelo ID
 *     tags: [Treino]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do treino
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campeonato:
 *                 type: string
 *                 maxLength: 150
 *                 description: Nome do campeonato
 *               pista:
 *                 type: string
 *                 maxLength: 250
 *                 description: Nome da pista
 *               melhorVolta:
 *                 type: string
 *                 description: Melhor volta do treino
 *               vitoria:
 *                 type: boolean
 *                 description: Indica se houve vitória no treino
 *               simulador:
 *                 type: string
 *                 description: Nome do simulador utilizado no treino
 *               dataTreino:
 *                 type: string
 *                 format: date-time
 *                 description: Data do treino
 *               desistencia:
 *                 type: boolean
 *                 description: Indica se houve desistência no treino
 *     responses:
 *       200:
 *         description: Treino atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Treino não encontrado
 *   delete:
 *     summary: Remove um treino pelo ID
 *     tags: [Treino]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do treino
 *     responses:
 *       200:
 *         description: Treino removido com sucesso
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Treino não encontrado
 */
router.get('/:id', TreinoController.getById);
router.put('/:id', TreinoController.update);
router.delete('/:id', TreinoController.delete);

/**
 * @swagger
 * /treinos/usuario/{usuarioId}:
 *   get:
 *     summary: Lista todos os treinos de um usuário específico
 *     tags: [Treino]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Treinos do usuário encontrados
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/usuario/:usuarioId', TreinoController.getByUsuario);

/**
 * @swagger
 * /treinos/usuario/{usuarioId}/estatisticas:
 *   get:
 *     summary: Obtém estatísticas dos treinos de um usuário
 *     tags: [Treino]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Estatísticas calculadas com sucesso
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
 *                     totalTreinos:
 *                       type: number
 *                       description: Total de treinos registrados
 *                     totalParticipacoes:
 *                       type: number
 *                       description: Total de participações
 *                     totalVitorias:
 *                       type: number
 *                       description: Total de vitórias
 *                     totalFaltas:
 *                       type: number
 *                       description: Total de faltas
 *                     totalFaltasJustificadas:
 *                       type: number
 *                       description: Total de faltas justificadas
 *                     totalFaltasNaoJustificadas:
 *                       type: number
 *                       description: Total de faltas não justificadas
 *                     totalDesistencias:
 *                       type: number
 *                       description: Total de desistências
 *                     taxaVitoria:
 *                       type: string
 *                       description: Taxa de vitória em porcentagem
 *                     taxaDesistencia:
 *                       type: string
 *                       description: Taxa de desistência em porcentagem
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/usuario/:usuarioId/estatisticas', TreinoController.getEstatisticas);

module.exports = router; 