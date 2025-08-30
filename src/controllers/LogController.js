const { Log } = require('../models/Log');
const ApiResponse = require('../models/ApiResponse');
const { formatarDataBrasileira, obterDataAtual } = require('../utils/DateFormatter');
const logger = require('../utils/logger');

// Função para formatar datas do log
const formatarLogResposta = (log) => {
    const logObj = log.toObject();
    
    // Formatar data no formato brasileiro
    if (logObj.createdAt) {
        logObj.createdAt = formatarDataBrasileira(logObj.createdAt);
    }
    
    return logObj;
};

const LogController = {
    // Criar log (usado internamente pelo sistema)
    async criarLog(dados) {
        try {
            const log = new Log({
                ...dados,
                createdAt: obterDataAtual()
            });
            await log.save();
            return log;
        } catch (error) {
            logger.error('Erro ao criar log:', error);
            // Não retornamos erro para não afetar a operação principal
        }
    },

    // Buscar todos os logs com paginação
    async getAll(req, res) {
        try {
            const { 
                page = 1, 
                limit = 50, 
                operacao, 
                entidade, 
                usuarioId, 
                sucesso,
                dataInicio,
                dataFim,
                nome,
                psnId
            } = req.query;

            // Validação dos parâmetros de paginação
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            
            if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
                return res.status(400).json(new ApiResponse(false, 'Parâmetros de paginação inválidos', null, { 
                    error: 'page deve ser >= 1, limit deve ser entre 1 e 100' 
                }));
            }

            const filtros = {};

            // Aplicar filtros
            if (operacao) filtros.operacao = operacao;
            if (entidade) filtros.entidade = entidade;
            if (usuarioId) filtros.usuarioId = usuarioId;
            if (sucesso !== undefined) filtros.sucesso = sucesso === 'true';

            // Filtro por data
            if (dataInicio || dataFim) {
                filtros.createdAt = {};
                if (dataInicio) filtros.createdAt.$gte = new Date(dataInicio);
                if (dataFim) filtros.createdAt.$lte = new Date(dataFim);
            }

            // Calcular skip para paginação
            const skip = (pageNumber - 1) * limitNumber;
            
            // Buscar logs com filtros e paginação
            let logs = await Log.find(filtros)
                .populate('usuarioId', 'nome email psnId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber);

            // Filtrar por nome e psnId do usuário se fornecidos
            if (nome || psnId) {
                logs = logs.filter(log => {
                    const usuario = log.usuarioId;
                    if (!usuario) return false;
                    
                    const nomeMatch = !nome || usuario.nome.toLowerCase().includes(nome.toLowerCase());
                    const psnIdMatch = !psnId || (usuario.psnId && usuario.psnId.toLowerCase().includes(psnId.toLowerCase()));
                    
                    return nomeMatch && psnIdMatch;
                });
            }

            // Contar total de documentos para paginação (sem filtros de nome/psnId)
            const total = await Log.countDocuments(filtros);

            // Calcular informações de paginação
            const totalPages = Math.ceil(total / limitNumber);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;

            // Formatar logs
            const logsFormatados = logs.map(log => formatarLogResposta(log));

            // Construir resposta com metadados de paginação
            const response = {
                logs: logsFormatados,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limitNumber,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? pageNumber + 1 : null,
                    prevPage: hasPrevPage ? pageNumber - 1 : null
                }
            };

            return res.status(200).json(new ApiResponse(true, 'Logs encontrados', response));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar logs', null, { error: err.message }));
        }
    },

    // Buscar log por ID
    async getById(req, res) {
        try {
            const log = await Log.findById(req.params.id).populate('usuarioId', 'nome email');

            if (!log) return res.status(404).json(new ApiResponse(false, 'Log não encontrado'));

            const logFormatado = formatarLogResposta(log);
            return res.status(200).json(new ApiResponse(true, 'Log encontrado', logFormatado));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar log', null, { error: err.message }));
        }
    },

    // Buscar logs de uma entidade específica
    async getByEntidade(req, res) {
        try {
            const { entidade, entidadeId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            // Validação dos parâmetros de paginação
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            
            if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
                return res.status(400).json(new ApiResponse(false, 'Parâmetros de paginação inválidos', null, { 
                    error: 'page deve ser >= 1, limit deve ser entre 1 e 100' 
                }));
            }

            // Calcular skip para paginação
            const skip = (pageNumber - 1) * limitNumber;

            // Buscar logs da entidade com paginação
            const logs = await Log.find({ 
                entidade, 
                entidadeId 
            })
            .populate('usuarioId', 'nome email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

            // Contar total de documentos para paginação
            const total = await Log.countDocuments({ entidade, entidadeId });

            // Calcular informações de paginação
            const totalPages = Math.ceil(total / limitNumber);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;

            // Formatar logs
            const logsFormatados = logs.map(log => formatarLogResposta(log));

            // Construir resposta com metadados de paginação
            const response = {
                logs: logsFormatados,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limitNumber,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? pageNumber + 1 : null,
                    prevPage: hasPrevPage ? pageNumber - 1 : null
                }
            };

            return res.status(200).json(new ApiResponse(true, 'Logs da entidade encontrados', response));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar logs da entidade', null, { error: err.message }));
        }
    },

    // Buscar logs de um usuário específico
    async getByUsuario(req, res) {
        try {
            const { usuarioId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            // Validação dos parâmetros de paginação
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            
            if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
                return res.status(400).json(new ApiResponse(false, 'Parâmetros de paginação inválidos', null, { 
                    error: 'page deve ser >= 1, limit deve ser entre 1 e 100' 
                }));
            }

            // Calcular skip para paginação
            const skip = (pageNumber - 1) * limitNumber;

            // Buscar logs do usuário com paginação
            const logs = await Log.find({ usuarioId })
                .populate('usuarioId', 'nome email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber);

            // Contar total de documentos para paginação
            const total = await Log.countDocuments({ usuarioId });

            // Calcular informações de paginação
            const totalPages = Math.ceil(total / limitNumber);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;

            // Formatar logs
            const logsFormatados = logs.map(log => formatarLogResposta(log));

            // Construir resposta com metadados de paginação
            const response = {
                logs: logsFormatados,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limitNumber,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? pageNumber + 1 : null,
                    prevPage: hasPrevPage ? pageNumber - 1 : null
                }
            };

            return res.status(200).json(new ApiResponse(true, 'Logs do usuário encontrados', response));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar logs do usuário', null, { error: err.message }));
        }
    },

    // Estatísticas de logs
    async getEstatisticas(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;
            
            const filtros = {};
            if (dataInicio || dataFim) {
                filtros.createdAt = {};
                if (dataInicio) filtros.createdAt.$gte = new Date(dataInicio);
                if (dataFim) filtros.createdAt.$lte = new Date(dataFim);
            }

            const [
                totalLogs,
                operacoesPorTipo,
                entidadesPorTipo,
                sucessosEFalhas,
                logsPorDia
            ] = await Promise.all([
                Log.countDocuments(filtros),
                Log.aggregate([
                    { $match: filtros },
                    { $group: { _id: '$operacao', total: { $sum: 1 } } },
                    { $sort: { total: -1 } }
                ]),
                Log.aggregate([
                    { $match: filtros },
                    { $group: { _id: '$entidade', total: { $sum: 1 } } },
                    { $sort: { total: -1 } }
                ]),
                Log.aggregate([
                    { $match: filtros },
                    { $group: { _id: '$sucesso', total: { $sum: 1 } } }
                ]),
                Log.aggregate([
                    { $match: filtros },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                            },
                            total: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } },
                    { $limit: 30 }
                ])
            ]);

            return res.status(200).json(new ApiResponse(true, 'Estatísticas de logs', {
                totalLogs,
                operacoesPorTipo,
                entidadesPorTipo,
                sucessosEFalhas,
                logsPorDia
            }));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar estatísticas', null, { error: err.message }));
        }
    }
};

module.exports = LogController; 