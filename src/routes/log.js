const express = require('express');
const router = express.Router();
const LogController = require('../controllers/LogController');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas de log
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica se a operação foi bem-sucedida
 *         message:
 *           type: string
 *           description: Mensagem descritiva da resposta
 *         data:
 *           type: object
 *           description: Dados retornados pela operação (opcional)
 *         error:
 *           type: object
 *           description: Detalhes do erro (opcional)
 *       example:
 *         success: true
 *         message: "Operação realizada com sucesso"
 *         data:
 *           id: "507f1f77bcf86cd799439011"
 *           nome: "Exemplo"
 *         error: null
 *     
 *     Log:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do log
 *         operacao:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *           description: Tipo de operação realizada
 *         entidade:
 *           type: string
 *           enum: [Usuario, Endereco, HistoricoCorrida]
 *           description: Nome da entidade afetada
 *         entidadeId:
 *           type: string
 *           description: ID da entidade afetada
 *         usuarioId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             nome:
 *               type: string
 *             email:
 *               type: string
 *           description: Usuário que executou a operação
 *         dadosAnteriores:
 *           type: object
 *           description: Dados antes da alteração (para UPDATE)
 *         dadosNovos:
 *           type: object
 *           description: Dados após a alteração
 *         ip:
 *           type: string
 *           description: IP de origem da requisição
 *         userAgent:
 *           type: string
 *           description: User-Agent da requisição
 *         endpoint:
 *           type: string
 *           description: Endpoint acessado
 *         metodo:
 *           type: string
 *           description: Método HTTP utilizado
 *         sucesso:
 *           type: boolean
 *           description: Se a operação foi bem-sucedida
 *         erro:
 *           type: string
 *           description: Mensagem de erro (se houver)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da operação (formato brasileiro)
 *     
 *     LogPaginado:
 *       type: object
 *       properties:
 *         logs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Log'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *               description: Página atual
 *             totalPages:
 *               type: integer
 *               description: Total de páginas
 *             totalItems:
 *               type: integer
 *               description: Total de registros
 *             itemsPerPage:
 *               type: integer
 *               description: Registros por página
 *             hasNextPage:
 *               type: boolean
 *               description: Indica se há próxima página
 *             hasPrevPage:
 *               type: boolean
 *               description: Indica se há página anterior
 *             nextPage:
 *               type: integer
 *               nullable: true
 *               description: Número da próxima página (null se não houver)
 *             prevPage:
 *               type: integer
 *               nullable: true
 *               description: Número da página anterior (null se não houver)
 *     
 *     LogEstatisticas:
 *       type: object
 *       properties:
 *         totalLogs:
 *           type: integer
 *           description: Total de logs
 *         operacoesPorTipo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Tipo de operação
 *               total:
 *                 type: integer
 *                 description: Quantidade de operações
 *         entidadesPorTipo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Nome da entidade
 *               total:
 *                 type: integer
 *                 description: Quantidade de operações
 *         sucessosEFalhas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: boolean
 *                 description: Se a operação foi bem-sucedida
 *               total:
 *                 type: integer
 *                 description: Quantidade de operações
 *         logsPorDia:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 format: date
 *                 description: Data
 *               total:
 *                 type: integer
 *                 description: Quantidade de logs
 */

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Listar todos os logs com filtros e paginação
 *     description: Retorna uma lista paginada de logs com opções de filtro
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página (mínimo 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Quantidade de registros por página (entre 1 e 100)
 *       - in: query
 *         name: operacao
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *         description: Filtrar por tipo de operação
 *       - in: query
 *         name: entidade
 *         schema:
 *           type: string
 *           enum: [Usuario, Endereco, HistoricoCorrida]
 *         description: Filtrar por entidade
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: string
 *         description: Filtrar por usuário que executou a operação
 *       - in: query
 *         name: sucesso
 *         schema:
 *           type: boolean
 *         description: Filtrar por sucesso da operação
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início para filtrar (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim para filtrar (YYYY-MM-DD)
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: Filtrar por nome do usuário que executou a operação (busca case-insensitive)
 *       - in: query
 *         name: psnId
 *         schema:
 *           type: string
 *         description: Filtrar por PSN ID do usuário que executou a operação (busca case-insensitive)
 *     responses:
 *       200:
 *         description: Lista de logs retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Logs encontrados"
 *               data:
 *                 logs:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     operacao: "CREATE"
 *                     entidade: "Usuario"
 *                     entidadeId: "507f1f77bcf86cd799439012"
 *                     usuarioId:
 *                       _id: "507f1f77bcf86cd799439013"
 *                       nome: "João Silva"
 *                       email: "joao@email.com"
 *                     dadosNovos:
 *                       nome: "João Silva"
 *                       email: "joao@email.com"
 *                     ip: "192.168.1.1"
 *                     userAgent: "Mozilla/5.0..."
 *                     endpoint: "/usuarios"
 *                     metodo: "POST"
 *                     sucesso: true
 *                     createdAt: "25/12/2024 14:30:45"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 5
 *                   totalItems: 250
 *                   itemsPerPage: 50
 *                   hasNextPage: true
 *                   hasPrevPage: false
 *                   nextPage: 2
 *                   prevPage: null
 *       400:
 *         description: Parâmetros de paginação inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Parâmetros de paginação inválidos"
 *               error:
 *                 error: "page deve ser >= 1, limit deve ser entre 1 e 100"
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', LogController.getAll);

/**
 * @swagger
 * /logs/estatisticas:
 *   get:
 *     summary: Obter estatísticas dos logs
 *     description: Retorna estatísticas gerais dos logs com filtros opcionais por data
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início para filtrar (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim para filtrar (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Estatísticas de logs"
 *               data:
 *                 totalLogs: 1250
 *                 operacoesPorTipo:
 *                   - _id: "CREATE"
 *                     total: 450
 *                   - _id: "UPDATE"
 *                     total: 600
 *                   - _id: "DELETE"
 *                     total: 150

 *                 entidadesPorTipo:
 *                   - _id: "Usuario"
 *                     total: 500
 *                   - _id: "Endereco"
 *                     total: 400
 *                   - _id: "HistoricoCorrida"
 *                     total: 350
 *                 sucessosEFalhas:
 *                   - _id: true
 *                     total: 1200
 *                   - _id: false
 *                     total: 50
 *                 logsPorDia:
 *                   - _id: "2024-12-25"
 *                     total: 45
 *                   - _id: "2024-12-24"
 *                     total: 38
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/estatisticas', LogController.getEstatisticas);

/**
 * @swagger
 * /logs/{id}:
 *   get:
 *     summary: Buscar log por ID
 *     description: Retorna um log específico pelo seu ID
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do log
 *     responses:
 *       200:
 *         description: Log encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Log encontrado"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 operacao: "UPDATE"
 *                 entidade: "Usuario"
 *                 entidadeId: "507f1f77bcf86cd799439012"
 *                 usuarioId:
 *                   _id: "507f1f77bcf86cd799439013"
 *                   nome: "João Silva"
 *                   email: "joao@email.com"
 *                 dadosAnteriores:
 *                   nome: "João"
 *                   email: "joao@email.com"
 *                 dadosNovos:
 *                   nome: "João Silva"
 *                   email: "joao.silva@email.com"
 *                 ip: "192.168.1.1"
 *                 userAgent: "Mozilla/5.0..."
 *                 endpoint: "/usuarios/507f1f77bcf86cd799439012"
 *                 metodo: "PUT"
 *                 sucesso: true
 *                 createdAt: "25/12/2024 14:30:45"
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Log não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', LogController.getById);

/**
 * @swagger
 * /logs/entidade/{entidade}/{entidadeId}:
 *   get:
 *     summary: Buscar logs de uma entidade específica
 *     description: Retorna todos os logs relacionados a uma entidade específica
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entidade
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Usuario, Endereco, HistoricoCorrida]
 *         description: Nome da entidade
 *       - in: path
 *         name: entidadeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da entidade
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página (mínimo 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Quantidade de registros por página (entre 1 e 100)
 *     responses:
 *       200:
 *         description: Logs da entidade encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Logs da entidade encontrados"
 *               data:
 *                 logs:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     operacao: "CREATE"
 *                     entidade: "Usuario"
 *                     entidadeId: "507f1f77bcf86cd799439012"
 *                     usuarioId:
 *                       _id: "507f1f77bcf86cd799439013"
 *                       nome: "Admin"
 *                       email: "admin@email.com"
 *                     dadosNovos:
 *                       nome: "João Silva"
 *                       email: "joao@email.com"
 *                     ip: "192.168.1.1"
 *                     userAgent: "Mozilla/5.0..."
 *                     endpoint: "/usuarios"
 *                     metodo: "POST"
 *                     sucesso: true
 *                     createdAt: "25/12/2024 14:30:45"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 2
 *                   totalItems: 35
 *                   itemsPerPage: 20
 *                   hasNextPage: true
 *                   hasPrevPage: false
 *                   nextPage: 2
 *                   prevPage: null
 *       400:
 *         description: Parâmetros de paginação inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Parâmetros de paginação inválidos"
 *               error:
 *                 error: "page deve ser >= 1, limit deve ser entre 1 e 100"
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Nenhum log encontrado para esta entidade
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/entidade/:entidade/:entidadeId', LogController.getByEntidade);

/**
 * @swagger
 * /logs/usuario/{usuarioId}:
 *   get:
 *     summary: Buscar logs de um usuário específico
 *     description: Retorna todos os logs de operações executadas por um usuário específico
 *     tags: [Logs]
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
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página (mínimo 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Quantidade de registros por página (entre 1 e 100)
 *     responses:
 *       200:
 *         description: Logs do usuário encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Logs do usuário encontrados"
 *               data:
 *                 logs:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     operacao: "UPDATE"
 *                     entidade: "Usuario"
 *                     entidadeId: "507f1f77bcf86cd799439012"
 *                     usuarioId:
 *                       _id: "507f1f77bcf86cd799439013"
 *                       nome: "João Silva"
 *                       email: "joao@email.com"
 *                     dadosAnteriores:
 *                       nome: "João"
 *                     dadosNovos:
 *                       nome: "João Silva"
 *                     ip: "192.168.1.1"
 *                     userAgent: "Mozilla/5.0..."
 *                     endpoint: "/usuarios/507f1f77bcf86cd799439012"
 *                     metodo: "PUT"
 *                     sucesso: true
 *                     createdAt: "25/12/2024 14:30:45"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 3
 *                   totalItems: 55
 *                   itemsPerPage: 20
 *                   hasNextPage: true
 *                   hasPrevPage: false
 *                   nextPage: 2
 *                   prevPage: null
 *       400:
 *         description: Parâmetros de paginação inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Parâmetros de paginação inválidos"
 *               error:
 *                 error: "page deve ser >= 1, limit deve ser entre 1 e 100"
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Nenhum log encontrado para este usuário
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/usuario/:usuarioId', LogController.getByUsuario);

module.exports = router; 