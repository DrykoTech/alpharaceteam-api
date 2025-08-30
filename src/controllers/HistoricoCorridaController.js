const { HistoricoCorrida } = require('../models/HistoricoCorrida');
const ApiResponse = require('../models/ApiResponse');

const { formatarDataBrasileira, obterDataAtual } = require('../utils/DateFormatter');

const formatarHistoricoResposta = (historico) => {
    const historicoObj = historico.toObject();
    
    // Formatar datas no formato brasileiro
    if (historicoObj.createdAt) {
        historicoObj.createdAt = formatarDataBrasileira(historicoObj.createdAt);
    }
    if (historicoObj.updatedAt) {
        historicoObj.updatedAt = formatarDataBrasileira(historicoObj.updatedAt);
    }
    if (historicoObj.dataCorrida) {
        historicoObj.dataCorrida = formatarDataBrasileira(historicoObj.dataCorrida);
    }
    
    return historicoObj;
};

const HistoricoCorridaController = {
    async create(req, res) {
        try {
            if (!req.body) {
                return res.status(400).json(new ApiResponse(false, 'Dados da requisição são obrigatórios'));
            }

            const historico = new HistoricoCorrida({ 
                ...req.body,
                linkTransmissao: req.body.linkTransmissao || '',
                createdAt: obterDataAtual(),
                updatedAt: obterDataAtual(),
                usuarioEdicaoId: req.usuario.id
            });

            await historico.save();

            const historicoFormatado = formatarHistoricoResposta(historico);
            return res.status(201).json(new ApiResponse(true, 'Histórico de corrida criado com sucesso', historicoFormatado));
        } catch (err) {
            return res.status(400).json(new ApiResponse(false, 'Erro ao criar histórico de corrida', null, { error: err.message }));
        }
    },
    async getAll(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                usuarioId, 
                liga, 
                simulador,
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

            // Construir filtro
            const filter = {};
            
            if (usuarioId) {
                filter.usuarioId = usuarioId;
            }
            
            if (liga) {
                filter.liga = { $regex: liga, $options: 'i' }; // Busca case-insensitive
            }
            
            if (simulador) {
                filter.simulador = { $regex: simulador, $options: 'i' }; // Busca case-insensitive
            }

            // Calcular skip para paginação
            const skip = (pageNumber - 1) * limitNumber;

            // Buscar históricos com filtros e paginação
            let historicos = await HistoricoCorrida.find(filter)
                .populate('usuarioId', 'nome psnId')
                .skip(skip)
                .limit(limitNumber)
                .sort({ createdAt: -1 }); // Ordenar por data de criação (mais recentes primeiro)

            // Filtrar por nome e psnId do usuário se fornecidos
            if (nome || psnId) {
                historicos = historicos.filter(historico => {
                    const usuario = historico.usuarioId;
                    if (!usuario) return false;
                    
                    const nomeMatch = !nome || usuario.nome.toLowerCase().includes(nome.toLowerCase());
                    const psnIdMatch = !psnId || usuario.psnId.toLowerCase().includes(psnId.toLowerCase());
                    
                    return nomeMatch && psnIdMatch;
                });
            }

            // Contar total de documentos para paginação (sem filtros de nome/psnId)
            const total = await HistoricoCorrida.countDocuments(filter);

            // Calcular informações de paginação
            const totalPages = Math.ceil(total / limitNumber);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;

            // Formatar históricos
            const historicosFormatados = historicos.map(historico => formatarHistoricoResposta(historico));

            // Construir resposta com metadados de paginação
            const response = {
                historicos: historicosFormatados,
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

            return res.status(200).json(new ApiResponse(true, 'Históricos de corrida encontrados', response));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar históricos de corrida', null, { error: err.message }));
        }
    },
    async getById(req, res) {
        try {
            const historico = await HistoricoCorrida.findById(req.params.id);

            if (!historico) return res.status(404).json(new ApiResponse(false, 'Histórico de corrida não encontrado'));

            const historicoFormatado = formatarHistoricoResposta(historico);
            return res.status(200).json(new ApiResponse(true, 'Histórico de corrida encontrado', historicoFormatado));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar histórico de corrida', null, { error: err.message }));
        }
    },
    async update(req, res) {
        try {
            let updateData = { ...req.body };
            
            // Adicionar updatedAt com a data atual
            updateData.updatedAt = obterDataAtual();
            // Adicionar usuarioEdicaoId com o ID do usuário logado
            updateData.usuarioEdicaoId = req.usuario.id;
            
            const historico = await HistoricoCorrida.findByIdAndUpdate(req.params.id, updateData, { new: true });

            if (!historico) return res.status(404).json(new ApiResponse(false, 'Histórico de corrida não encontrado'));

            const historicoFormatado = formatarHistoricoResposta(historico);
            return res.status(200).json(new ApiResponse(true, 'Histórico de corrida atualizado com sucesso', historicoFormatado));
        } catch (err) {
            return res.status(400).json(new ApiResponse(false, 'Erro ao atualizar histórico de corrida', null, { error: err.message }));
        }
    },
    async delete(req, res) {
        try {
            const historico = await HistoricoCorrida.findByIdAndDelete(req.params.id);

            if (!historico) return res.status(404).json(new ApiResponse(false, 'Histórico de corrida não encontrado'));

            return res.status(200).json(new ApiResponse(true, 'Histórico de corrida deletado com sucesso'));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao deletar histórico de corrida', null, { error: err.message }));
        }
    },
    async getByUsuario(req, res) {
        try {
            const { usuarioId } = req.params;

            if (!usuarioId) {
                return res.status(400).json(new ApiResponse(false, 'ID do usuário é obrigatório'));
            }

            const historicos = await HistoricoCorrida.find({ usuarioId }).sort({ createdAt: -1 });
            
            if (historicos.length === 0) {
                return res.status(200).json(new ApiResponse(true, 'Nenhum histórico de corrida encontrado para este usuário', []));
            }

            const historicosFormatados = historicos.map(historico => formatarHistoricoResposta(historico));

            return res.status(200).json(new ApiResponse(true, 'Históricos de corrida do usuário encontrados', historicosFormatados));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar histórico de corrida do usuário', null, { error: err.message }));
        }
    }
};

module.exports = HistoricoCorridaController; 