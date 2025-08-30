const { Treino } = require('../models/Treino');
const Usuario = require('../models/Usuario');
const ApiResponse = require('../models/ApiResponse');
const { formatarDataBrasileira, obterDataAtual } = require('../utils/DateFormatter');

// Função para formatar treino na resposta
const formatarTreinoResposta = (treino) => {
    const treinoObj = treino.toObject();
    
    // Formatar datas no formato brasileiro
    if (treinoObj.dataCadastro) {
        treinoObj.dataCadastro = formatarDataBrasileira(treinoObj.dataCadastro);
    }
    if (treinoObj.dataAlteracao) {
        treinoObj.dataAlteracao = formatarDataBrasileira(treinoObj.dataAlteracao);
    }
    if (treinoObj.dataTreino) {
        treinoObj.dataTreino = formatarDataBrasileira(treinoObj.dataTreino);
    }
    
    return treinoObj;
};

const TreinoController = {
    async create(req, res) {
        try {
            const { 
                usuarioId, 
                campeonato, 
                pista, 
                melhorVolta, 
                vitoria, 
                simulador,
                dataTreino,
                desistencia
            } = req.body;

            // Validação de campos obrigatórios
            if (!usuarioId || !campeonato || !pista || !melhorVolta || vitoria === undefined || !simulador || !dataTreino) {
                return res.status(400).json(
                    new ApiResponse(false, 'Campos obrigatórios devem ser preenchidos',
                        null,
                        { error: 'Campos obrigatórios: usuarioId, campeonato, pista, melhorVolta, vitoria, simulador, dataTreino' })
                );
            }

            // Validação do simulador
            if (!simulador || typeof simulador !== 'string' || simulador.trim() === '') {
                return res.status(400).json(
                    new ApiResponse(false, 'Simulador é obrigatório e deve ser uma string não vazia', null, { error: 'Campo simulador é obrigatório' })
                );
            }

            // Verificar se o usuário existe
            const usuario = await Usuario.findById(usuarioId);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            }

            const treino = new Treino({
                usuarioId,
                campeonato,
                pista,
                melhorVolta,
                vitoria,
                simulador,
                dataTreino,
                desistencia: desistencia || false,
                dataCadastro: obterDataAtual(),
                dataAlteracao: obterDataAtual(),
                usuarioEdicaoId: req.usuario?.id
            });

            await treino.save();

            const treinoFormatado = formatarTreinoResposta(treino);
            return res.status(201).json(new ApiResponse(true, 'Treino criado com sucesso', treinoFormatado));
        } catch (err) {
            return res.status(400).json(new ApiResponse(false, 'Erro ao criar treino', null, { error: err.message }));
        }
    },

    async getAll(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                usuarioId, 
                simulador, 
                pista,
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
            
            if (simulador) {
                filter.simulador = { $regex: simulador, $options: 'i' }; // Busca case-insensitive
            }
            
            if (pista) {
                filter.pista = { $regex: pista, $options: 'i' }; // Busca case-insensitive
            }

            // Calcular skip para paginação
            const skip = (pageNumber - 1) * limitNumber;

            // Buscar treinos com filtros e paginação
            let treinos = await Treino.find(filter)
                .populate('usuarioId', 'nome psnId')
                .skip(skip)
                .limit(limitNumber)
                .sort({ createdAt: -1 }); // Ordenar por data de criação (mais recentes primeiro)

            // Filtrar por nome e psnId do usuário se fornecidos
            if (nome || psnId) {
                treinos = treinos.filter(treino => {
                    const usuario = treino.usuarioId;
                    if (!usuario) return false;
                    
                    const nomeMatch = !nome || usuario.nome.toLowerCase().includes(nome.toLowerCase());
                    const psnIdMatch = !psnId || usuario.psnId.toLowerCase().includes(psnId.toLowerCase());
                    
                    return nomeMatch && psnIdMatch;
                });
            }

            // Contar total de documentos para paginação (sem filtros de nome/psnId)
            const total = await Treino.countDocuments(filter);

            // Calcular informações de paginação
            const totalPages = Math.ceil(total / limitNumber);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;

            // Formatar treinos
            const treinosFormatados = treinos.map(treino => formatarTreinoResposta(treino));

            // Construir resposta com metadados de paginação
            const response = {
                treinos: treinosFormatados,
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

            return res.status(200).json(new ApiResponse(true, 'Treinos encontrados', response));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar treinos', null, { error: err.message }));
        }
    },

    async getById(req, res) {
        try {
            const treino = await Treino.findById(req.params.id).populate('usuarioId', 'nome psnId');
            if (!treino) return res.status(404).json(new ApiResponse(false, 'Treino não encontrado'));
            
            const treinoFormatado = formatarTreinoResposta(treino);
            return res.status(200).json(new ApiResponse(true, 'Treino encontrado', treinoFormatado));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar treino', null, { error: err.message }));
        }
    },

    async getByUsuario(req, res) {
        try {
            const { usuarioId } = req.params;
            
            // Verificar se o usuário existe
            const usuario = await Usuario.findById(usuarioId);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            }

            const treinos = await Treino.find({ usuarioId }).populate('usuarioId', 'nome psnId');
            const treinosFormatados = treinos.map(treino => formatarTreinoResposta(treino));
            
            return res.status(200).json(new ApiResponse(true, 'Treinos do usuário encontrados', treinosFormatados));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar treinos do usuário', null, { error: err.message }));
        }
    },

    async update(req, res) {
        try {
            const { 
                campeonato, 
                pista, 
                melhorVolta, 
                vitoria, 
                simulador,
                dataTreino,
                desistencia
            } = req.body;

            // Validação do simulador se fornecido
            if (simulador !== undefined && (typeof simulador !== 'string' || simulador.trim() === '')) {
                return res.status(400).json(
                    new ApiResponse(false, 'Simulador deve ser uma string não vazia', null, { error: 'Campo simulador deve ser uma string válida' })
                );
            }

            let updateData = { 
                campeonato, 
                pista, 
                melhorVolta, 
                vitoria, 
                simulador,
                dataTreino,
                desistencia,
                dataAlteracao: obterDataAtual(),
                usuarioEdicaoId: req.usuario?.id
            };

            // Remover campos undefined
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            const treino = await Treino.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('usuarioId', 'nome psnId');
            if (!treino) return res.status(404).json(new ApiResponse(false, 'Treino não encontrado'));
            
            const treinoFormatado = formatarTreinoResposta(treino);
            return res.status(200).json(new ApiResponse(true, 'Treino atualizado com sucesso', treinoFormatado));
        } catch (err) {
            return res.status(400).json(new ApiResponse(false, 'Erro ao atualizar treino', null, { error: err.message }));
        }
    },

    async delete(req, res) {
        try {
            const treino = await Treino.findByIdAndDelete(req.params.id);
            if (!treino) return res.status(404).json(new ApiResponse(false, 'Treino não encontrado'));
            return res.status(200).json(new ApiResponse(true, 'Treino deletado com sucesso'));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao deletar treino', null, { error: err.message }));
        }
    },

    async getEstatisticas(req, res) {
        try {
            const { usuarioId } = req.params;
            
            // Verificar se o usuário existe
            const usuario = await Usuario.findById(usuarioId);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            }

            const treinos = await Treino.find({ usuarioId });
            
            const estatisticas = {
                totalTreinos: treinos.length,
                totalParticipacoes: treinos.reduce((sum, treino) => sum + (treino.participacao ? 1 : 0), 0),
                totalVitorias: treinos.reduce((sum, treino) => sum + (treino.vitoria ? 1 : 0), 0),
                totalDesistencias: treinos.reduce((sum, treino) => sum + (treino.desistencia ? 1 : 0), 0),
                taxaVitoria: treinos.length > 0 ? 
                    (treinos.reduce((sum, treino) => sum + (treino.vitoria ? 1 : 0), 0) / treinos.length * 100).toFixed(2) + '%' : '0%',
                taxaDesistencia: treinos.length > 0 ? 
                    (treinos.reduce((sum, treino) => sum + (treino.desistencia ? 1 : 0), 0) / treinos.length * 100).toFixed(2) + '%' : '0%'
            };

            return res.status(200).json(new ApiResponse(true, 'Estatísticas calculadas com sucesso', estatisticas));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao calcular estatísticas', null, { error: err.message }));
        }
    }
};

module.exports = TreinoController; 