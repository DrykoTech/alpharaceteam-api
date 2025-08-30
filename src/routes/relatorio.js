const express = require('express');
const router = express.Router();
const RelatorioController = require('../controllers/RelatorioController');
const { heavyOperationRateLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /relatorios:
 *   get:
 *     summary: Lista todos os tipos de relatórios disponíveis
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de relatórios disponíveis
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
 *                     usuario:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         perfil:
 *                           type: string
 *                     relatorios:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tipo:
 *                             type: string
 *                           nome:
 *                             type: string
 *                           descricao:
 *                             type: string
 *                           url:
 *                             type: string
 *                           parametros:
 *                             type: array
 *                             items:
 *                               type: string
 *                           restricoes:
 *                             type: string
 *                     total:
 *                       type: number
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.get('/', RelatorioController.getAll);

/**
 * @swagger
 * /relatorios/usuario/{usuarioId}/performance:
 *   get:
 *     summary: Gera relatório geral de performance de um usuário
 *     tags: [Relatórios]
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
 *         name: periodoInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período (YYYY-MM-DD)
 *       - in: query
 *         name: periodoFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Relatório de performance gerado com sucesso
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
 *                     usuario:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         nome:
 *                           type: string
 *                         psnId:
 *                           type: string
 *                         nivel:
 *                           type: string
 *                         perfil:
 *                           type: string
 *                         plataforma:
 *                           type: string
 *                     periodo:
 *                       type: object
 *                       properties:
 *                         inicio:
 *                           type: string
 *                         fim:
 *                           type: string
 *                     estatisticasTreino:
 *                       type: object
 *                       properties:
 *                         totalTreinos:
 *                           type: number
 *                         totalParticipacoes:
 *                           type: number
 *                         totalVitorias:
 *                           type: number
 *                         totalFaltas:
 *                           type: number
 *                         taxaVitoria:
 *                           type: string
 *                         simuladoresUtilizados:
 *                           type: array
 *                           items:
 *                             type: string
 *                         pistasTreinadas:
 *                           type: array
 *                           items:
 *                             type: string
 *                     estatisticasCorrida:
 *                       type: object
 *                       properties:
 *                         totalCorridas:
 *                           type: number
 *                         totalPontuacao:
 *                           type: number
 *                         pontuacaoMedia:
 *                           type: string
 *                         vitorias:
 *                           type: number
 *                         podios:
 *                           type: number
 *                         vmrCount:
 *                           type: number
 *                         melhorPosicao:
 *                           type: number
 *                         piorPosicao:
 *                           type: number
 *                         ligasParticipadas:
 *                           type: array
 *                           items:
 *                             type: string
 *                         simuladoresUtilizados:
 *                           type: array
 *                           items:
 *                             type: string
 *                     evolucaoTemporal:
 *                       type: object
 *                       properties:
 *                         treinosPorMes:
 *                           type: object
 *                         corridasPorMes:
 *                           type: object
 *                         pontuacaoPorMes:
 *                           type: object
 *                     resumo:
 *                       type: object
 *                       properties:
 *                         totalAtividades:
 *                           type: number
 *                         taxaParticipacao:
 *                           type: string
 *                         performanceGeral:
 *                           type: string
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/usuario/:usuarioId/performance', heavyOperationRateLimiter, RelatorioController.relatorioPerformanceUsuario);

/**
 * @swagger
 * /relatorios/usuario/{usuarioId}/treinos:
 *   get:
 *     summary: Gera relatório detalhado de treinos de um usuário
 *     tags: [Relatórios]
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
 *         name: simulador
 *         schema:
 *           type: string
 *         description: Filtrar por simulador específico
 *       - in: query
 *         name: pista
 *         schema:
 *           type: string
 *         description: Filtrar por pista específica
 *       - in: query
 *         name: periodoInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período (YYYY-MM-DD)
 *       - in: query
 *         name: periodoFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Relatório detalhado de treinos gerado com sucesso
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
 *                     usuario:
 *                       type: object
 *                     filtros:
 *                       type: object
 *                     resumo:
 *                       type: object
 *                     analisePorSimulador:
 *                       type: object
 *                     analisePorPista:
 *                       type: object
 *                     frequenciaPorPeriodo:
 *                       type: object
 *                     treinos:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/usuario/:usuarioId/treinos', heavyOperationRateLimiter, RelatorioController.relatorioDetalhadoTreinos);

/**
 * @swagger
 * /relatorios/usuario/{usuarioId}/corridas:
 *   get:
 *     summary: Gera relatório detalhado de corridas de um usuário
 *     tags: [Relatórios]
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
 *         name: liga
 *         schema:
 *           type: string
 *         description: Filtrar por liga específica
 *       - in: query
 *         name: simulador
 *         schema:
 *           type: string
 *         description: Filtrar por simulador específico
 *       - in: query
 *         name: periodoInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período (YYYY-MM-DD)
 *       - in: query
 *         name: periodoFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Relatório detalhado de corridas gerado com sucesso
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
 *                     usuario:
 *                       type: object
 *                     filtros:
 *                       type: object
 *                     resumo:
 *                       type: object
 *                     analisePorLiga:
 *                       type: object
 *                     analisePorSimulador:
 *                       type: object
 *                     evolucaoPorEtapa:
 *                       type: object
 *                     corridas:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/usuario/:usuarioId/corridas', heavyOperationRateLimiter, RelatorioController.relatorioDetalhadoCorridas);

/**
 * @swagger
 * /relatorios/usuario/{usuarioId}/faltas:
 *   get:
 *     summary: Gera relatório detalhado de faltas de um usuário
 *     tags: [Relatórios]
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
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [JUSTIFICADA, NAO_JUSTIFICADA]
 *         description: Filtrar por tipo de justificativa
 *       - in: query
 *         name: periodoInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período (YYYY-MM-DD)
 *       - in: query
 *         name: periodoFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Relatório detalhado de faltas gerado com sucesso
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
 *                     usuario:
 *                       type: object
 *                     filtros:
 *                       type: object
 *                     estatisticasGerais:
 *                       type: object
 *                     analisePorTipoFalta:
 *                       type: object
 *                     analisePorPeriodo:
 *                       type: object
 *                     justificativasComuns:
 *                       type: array
 *                     detalhamentoFaltas:
 *                       type: array
 *                     resumo:
 *                       type: object
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/usuario/:usuarioId/faltas', heavyOperationRateLimiter, RelatorioController.relatorioDetalhadoFaltas);

/**
 * @swagger
 * /relatorios/comparativo:
 *   get:
 *     summary: Gera relatório comparativo entre múltiplos usuários
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuarioIds
 *         required: true
 *         schema:
 *           type: string
 *         description: IDs dos usuários separados por vírgula (ex: id1,id2,id3)
 *       - in: query
 *         name: periodoInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período (YYYY-MM-DD)
 *       - in: query
 *         name: periodoFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Relatório comparativo gerado com sucesso
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
 *                     periodo:
 *                       type: object
 *                       properties:
 *                         inicio:
 *                           type: string
 *                         fim:
 *                           type: string
 *                     comparativo:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           usuario:
 *                             type: object
 *                           estatisticasTreino:
 *                             type: object
 *                           estatisticasCorrida:
 *                             type: object
 *                           performanceGeral:
 *                             type: object
 *                     ranking:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           posicao:
 *                             type: number
 *                           usuario:
 *                             type: string
 *                           psnId:
 *                             type: string
 *                           scoreGeral:
 *                             type: string
 *                           totalAtividades:
 *                             type: number
 *       400:
 *         description: IDs dos usuários não fornecidos
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Um ou mais usuários não encontrados
 */
router.get('/comparativo', RelatorioController.relatorioComparativo);

/**
 * @swagger
 * /relatorios/equipe:
 *   get:
 *     summary: Gera relatório geral da equipe com todos os pilotos
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periodoInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período (YYYY-MM-DD)
 *       - in: query
 *         name: periodoFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período (YYYY-MM-DD)
 *       - in: query
 *         name: nivel
 *         schema:
 *           type: string
 *         description: Filtrar por nível específico (Iniciante, Intermediário, Avançado)
 *       - in: query
 *         name: perfil
 *         schema:
 *           type: string
 *         description: Filtrar por perfil específico (Competitivo, Casual, etc.)
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo (true/false)
 *     responses:
 *       200:
 *         description: Relatório geral da equipe gerado com sucesso
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
 *                     periodo:
 *                       type: object
 *                       properties:
 *                         inicio:
 *                           type: string
 *                         fim:
 *                           type: string
 *                     filtros:
 *                       type: object
 *                       properties:
 *                         nivel:
 *                           type: string
 *                         perfil:
 *                           type: string
 *                         ativo:
 *                           type: string
 *                     estatisticasGerais:
 *                       type: object
 *                       properties:
 *                         totalPilotos:
 *                           type: number
 *                         totalTreinos:
 *                           type: number
 *                         totalCorridas:
 *                           type: number
 *                         totalParticipacoes:
 *                           type: number
 *                         totalVitorias:
 *                           type: number
 *                         totalPontuacao:
 *                           type: number
 *                         pontuacaoMediaEquipe:
 *                           type: string
 *                         taxaVitoriaEquipe:
 *                           type: string
 *                         simuladoresUtilizados:
 *                           type: array
 *                           items:
 *                             type: string
 *                         pistasUtilizadas:
 *                           type: array
 *                           items:
 *                             type: string
 *                         ligasParticipadas:
 *                           type: array
 *                           items:
 *                             type: string
 *                     analisePorNivel:
 *                       type: object
 *                     rankingPilotos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           posicao:
 *                             type: number
 *                           nome:
 *                             type: string
 *                           psnId:
 *                             type: string
 *                           nivel:
 *                             type: string
 *                           scoreGeral:
 *                             type: string
 *                           totalAtividades:
 *                             type: number
 *                           pontuacaoMedia:
 *                             type: string
 *                     pilotos:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Nenhum usuário encontrado com os filtros aplicados
 */
router.get('/equipe', RelatorioController.relatorioGeralEquipe);

module.exports = router; 