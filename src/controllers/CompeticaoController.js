const { Competicao } = require('../models/Competicao');
const Usuario = require('../models/Usuario');
const ApiResponse = require('../models/ApiResponse');
const { formatarDataBrasileira } = require('../utils/DateFormatter');

// Função para formatar resposta da competição
const formatarCompeticaoResposta = (competicao) => {
    const competicaoObj = competicao.toObject();
    
    // Formatar datas no formato brasileiro
    if (competicaoObj.dataInicio) {
        competicaoObj.dataInicio = formatarDataBrasileira(competicaoObj.dataInicio);
    }
    if (competicaoObj.dataCadastro) {
        competicaoObj.dataCadastro = formatarDataBrasileira(competicaoObj.dataCadastro);
    }
    if (competicaoObj.dataAlteracao) {
        competicaoObj.dataAlteracao = formatarDataBrasileira(competicaoObj.dataAlteracao);
    }
    
    return competicaoObj;
};

const CompeticaoController = {
    async create(req, res) {
        try {
            const { 
                nome, 
                dataInicio, 
                grids, 
                campeonatos 
            } = req.body;

            const usuarioRegistroId = req.user.id;

            // Validação de campos obrigatórios
            if (!nome || !dataInicio || !grids || !campeonatos) {
                return res.status(400).json(
                    new ApiResponse(false, 'Todos os campos obrigatórios devem ser preenchidos',
                        null,
                        { error: 'Campos obrigatórios: nome, dataInicio, grids, campeonatos' })
                );
            }

            // Validação de data
            if (isNaN(Date.parse(dataInicio))) {
                return res.status(400).json(new ApiResponse(false, 'Data de início inválida', null, { error: 'Formato de data inválido' }));
            }

            // Validação de arrays
            if (!Array.isArray(grids) || grids.length === 0) {
                return res.status(400).json(new ApiResponse(false, 'Grids deve ser um array não vazio', null, { error: 'Campo grids é obrigatório e deve ser um array' }));
            }

            if (!Array.isArray(campeonatos) || campeonatos.length === 0) {
                return res.status(400).json(new ApiResponse(false, 'Campeonatos deve ser um array não vazio', null, { error: 'Campo campeonatos é obrigatório e deve ser um array' }));
            }

            // Verificar se usuário existe
            const usuario = await Usuario.findById(usuarioRegistroId);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado', null, { error: 'Usuário que está registrando a competição não existe' }));
            }

            const competicao = new Competicao({
                nome,
                dataInicio,
                grids,
                campeonatos,
                usuarioRegistroId
            });

            await competicao.save();

            const competicaoFormatada = formatarCompeticaoResposta(competicao);

            return res.status(201).json(new ApiResponse(true, 'Competição criada com sucesso', competicaoFormatada));

        } catch (error) {
            console.error('Erro ao criar competição:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async getAll(req, res) {
        try {
            const competicoes = await Competicao.find()
                .populate('usuarioRegistroId', 'nome email')
                .sort({ dataCadastro: -1 });

            const competicoesFormatadas = competicoes.map(formatarCompeticaoResposta);

            return res.status(200).json(new ApiResponse(true, 'Competições listadas com sucesso', competicoesFormatadas));

        } catch (error) {
            console.error('Erro ao listar competições:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json(new ApiResponse(false, 'ID da competição é obrigatório', null, { error: 'ID não fornecido' }));
            }

            const competicao = await Competicao.findById(id)
                .populate('usuarioRegistroId', 'nome email');

            if (!competicao) {
                return res.status(404).json(new ApiResponse(false, 'Competição não encontrada', null, { error: 'Competição não existe' }));
            }

            const competicaoFormatada = formatarCompeticaoResposta(competicao);

            return res.status(200).json(new ApiResponse(true, 'Competição encontrada com sucesso', competicaoFormatada));

        } catch (error) {
            console.error('Erro ao buscar competição:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { nome, dataInicio, grids, campeonatos } = req.body;
            const usuarioEdicaoId = req.user.id;

            if (!id) {
                return res.status(400).json(new ApiResponse(false, 'ID da competição é obrigatório', null, { error: 'ID não fornecido' }));
            }

            // Verificar se competição existe
            const competicaoExistente = await Competicao.findById(id);
            if (!competicaoExistente) {
                return res.status(404).json(new ApiResponse(false, 'Competição não encontrada', null, { error: 'Competição não existe' }));
            }

            // Verificar se usuário existe
            const usuario = await Usuario.findById(usuarioEdicaoId);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado', null, { error: 'Usuário que está editando não existe' }));
            }

            const updateData = { usuarioEdicaoId };

            if (nome !== undefined) updateData.nome = nome;
            if (dataInicio !== undefined) {
                if (isNaN(Date.parse(dataInicio))) {
                    return res.status(400).json(new ApiResponse(false, 'Data de início inválida', null, { error: 'Formato de data inválido' }));
                }
                updateData.dataInicio = dataInicio;
            }
            if (grids !== undefined) {
                if (!Array.isArray(grids) || grids.length === 0) {
                    return res.status(400).json(new ApiResponse(false, 'Grids deve ser um array não vazio', null, { error: 'Campo grids deve ser um array' }));
                }
                updateData.grids = grids;
            }
            if (campeonatos !== undefined) {
                if (!Array.isArray(campeonatos) || campeonatos.length === 0) {
                    return res.status(400).json(new ApiResponse(false, 'Campeonatos deve ser um array não vazio', null, { error: 'Campo campeonatos deve ser um array' }));
                }
                updateData.campeonatos = campeonatos;
            }

            const competicao = await Competicao.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).populate('usuarioRegistroId', 'nome email');

            const competicaoFormatada = formatarCompeticaoResposta(competicao);

            return res.status(200).json(new ApiResponse(true, 'Competição atualizada com sucesso', competicaoFormatada));

        } catch (error) {
            console.error('Erro ao atualizar competição:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json(new ApiResponse(false, 'ID da competição é obrigatório', null, { error: 'ID não fornecido' }));
            }

            const competicao = await Competicao.findById(id);
            if (!competicao) {
                return res.status(404).json(new ApiResponse(false, 'Competição não encontrada', null, { error: 'Competição não existe' }));
            }

            await Competicao.findByIdAndDelete(id);

            return res.status(200).json(new ApiResponse(true, 'Competição excluída com sucesso', null));

        } catch (error) {
            console.error('Erro ao excluir competição:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    }
};

module.exports = CompeticaoController; 