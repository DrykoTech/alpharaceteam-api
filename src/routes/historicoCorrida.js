const express = require('express');
const router = express.Router();

const HistoricoCorridaController = require('../controllers/HistoricoCorridaController');

/**
 * @swagger
 * components:
 *   schemas:
 *     HistoricoCorrida:
 *       type: object
 *       required:
 *         - usuarioId
 *         - liga
 *         - etapa
 *         - pista
 *         - grid
 *         - simulador
 *         - posicaoLargada
 *         - posicaoChegada
 *         - vmr
 *         - pontuacao
 *         - linkTransmissao
 *         - dataCorrida
 *       properties:
 *         usuarioId:
 *           type: string
 *           description: ID do usuário
 *         liga:
 *           type: string
 *         etapa:
 *           type: integer
 *         pista:
 *           type: string
 *         grid:
 *           type: string
 *         simulador:
 *           type: string
 *           description: Nome do simulador utilizado
 *         posicaoLargada:
 *           type: integer
 *         posicaoChegada:
 *           type: integer
 *         vmr:
 *           type: boolean
 *         pontuacao:
 *           type: number
 *           description: Pontuação obtida na corrida
 *         linkTransmissao:
 *           type: string
 *           description: Link da transmissão da corrida
 *         dataCorrida:
 *           type: string
 *           format: date-time
 *           description: Data da corrida
 *         linkTransmissao:
 *           type: string
 *           description: Link da transmissão da corrida
 *       example:
 *         usuarioId: "665f1b2c2c8b2c001f7e4a1a"
 *         liga: "Liga Alpha"
 *         etapa: 1
 *         pista: "Interlagos"
 *         grid: "A"
 *         simulador: "Assetto Corsa"
 *         posicaoLargada: 5
 *         posicaoChegada: 2
 *         vmr: true
 *         pontuacao: 18
 *         linkTransmissao: "https://youtube.com/transmissao123"
 *         dataCorrida: "2024-01-15T20:00:00.000Z"
 */

/**
 * @swagger
 * /historicos-corrida:
 *   get:
 *     summary: Lista todos os históricos de corrida com paginação e filtros
 *     description: Retorna uma lista paginada de históricos de corrida com opções de filtro
 *     tags: [HistoricoCorrida]
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
 *         name: liga
 *         schema:
 *           type: string
 *         description: Filtrar por liga (busca case-insensitive)
 *       - in: query
 *         name: simulador
 *         schema:
 *           type: string
 *         description: Filtrar por simulador (busca case-insensitive)
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
 *         description: Lista de históricos de corrida retornada com sucesso
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
 *                     historicos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           usuarioId:
 *                             type: string
 *                           liga:
 *                             type: string
 *                           simulador:
 *                             type: string
 *                           posicao:
 *                             type: number
 *                           pontuacao:
 *                             type: number
 *                           dataCorrida:
 *                             type: string
 *                           linkTransmissao:
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
 *     summary: Cria um novo histórico de corrida
 *     tags: [HistoricoCorrida]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HistoricoCorrida'
 *     responses:
 *       201:
 *         description: Histórico de corrida criado com sucesso
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.post('/', HistoricoCorridaController.create);
router.get('/', HistoricoCorridaController.getAll);

/**
 * @swagger
 * /historicos-corrida/usuario/{usuarioId}:
 *   get:
 *     summary: Lista todos os históricos de corrida de um usuário específico
 *     tags: [HistoricoCorrida]
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
 *         description: Lista de históricos do usuário
 *       400:
 *         description: ID do usuário não fornecido
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.get('/usuario/:usuarioId', HistoricoCorridaController.getByUsuario);

/**
 * @swagger
 * /historicos-corrida/{id}:
 *   get:
 *     summary: Busca um histórico de corrida por ID
 *     tags: [HistoricoCorrida]
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
 *         description: Histórico encontrado
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *   put:
 *     summary: Atualiza um histórico de corrida por ID
 *     tags: [HistoricoCorrida]
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
 *             $ref: '#/components/schemas/HistoricoCorrida'
 *     responses:
 *       200:
 *         description: Histórico atualizado
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *   delete:
 *     summary: Deleta um histórico de corrida por ID
 *     tags: [HistoricoCorrida]
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
 *         description: Histórico deletado
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.get('/:id', HistoricoCorridaController.getById);
router.put('/:id', HistoricoCorridaController.update);
router.delete('/:id', HistoricoCorridaController.delete);

module.exports = router; 