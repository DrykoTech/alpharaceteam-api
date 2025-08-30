const { CorridaOficial } = require('../models/CorridaOficial');
const { Competicao } = require('../models/Competicao');
const Usuario = require('../models/Usuario');
const ApiResponse = require('../models/ApiResponse');
const { formatarDataBrasileira } = require('../utils/DateFormatter');

// Função para formatar resposta da corrida oficial
const formatarCorridaOficialResposta = (corridaOficial) => {
    const corridaObj = corridaOficial.toObject();
    
    // Formatar datas no formato brasileiro
    if (corridaObj.dataCorrida) {
        corridaObj.dataCorrida = formatarDataBrasileira(corridaObj.dataCorrida);
    }
    if (corridaObj.dataCadastro) {
        corridaObj.dataCadastro = formatarDataBrasileira(corridaObj.dataCadastro);
    }
    if (corridaObj.dataAlteracao) {
        corridaObj.dataAlteracao = formatarDataBrasileira(corridaObj.dataAlteracao);
    }
    
    return corridaObj;
};

const CorridaOficialController = {
    async create(req, res) {
        try {
            const { 
                dataCorrida, 
                usuarios, 
                competicao 
            } = req.body;

            const usuarioRegistroId = req.user.id;

            // Validação de campos obrigatórios
            if (!dataCorrida || !usuarios || !competicao) {
                return res.status(400).json(
                    new ApiResponse(false, 'Todos os campos obrigatórios devem ser preenchidos',
                        null,
                        { error: 'Campos obrigatórios: dataCorrida, usuarios, competicao' })
                );
            }

            // Validação de data
            if (isNaN(Date.parse(dataCorrida))) {
                return res.status(400).json(new ApiResponse(false, 'Data da corrida inválida', null, { error: 'Formato de data inválido' }));
            }

            // Validação de array de usuários
            if (!Array.isArray(usuarios) || usuarios.length === 0) {
                return res.status(400).json(new ApiResponse(false, 'Usuários deve ser um array não vazio', null, { error: 'Campo usuarios é obrigatório e deve ser um array' }));
            }

            // Verificar se usuário que está registrando existe
            const usuarioRegistro = await Usuario.findById(usuarioRegistroId);
            if (!usuarioRegistro) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado', null, { error: 'Usuário que está registrando a corrida não existe' }));
            }

            // Verificar se todos os usuários participantes existem
            const usuariosExistentes = await Usuario.find({ _id: { $in: usuarios } });
            if (usuariosExistentes.length !== usuarios.length) {
                return res.status(404).json(new ApiResponse(false, 'Um ou mais usuários não encontrados', null, { error: 'Alguns usuários participantes não existem' }));
            }

            // Verificar se competição existe
            const competicaoExistente = await Competicao.findById(competicao);
            if (!competicaoExistente) {
                return res.status(404).json(new ApiResponse(false, 'Competição não encontrada', null, { error: 'Competição não existe' }));
            }

            const corridaOficial = new CorridaOficial({
                dataCorrida,
                usuarios,
                competicao,
                usuarioRegistroId
            });

            await corridaOficial.save();

            const corridaFormatada = await CorridaOficial.findById(corridaOficial._id)
                .populate('usuarios', 'nome email')
                .populate('usuarioRegistroId', 'nome email')
                .populate('competicao', 'nome grids campeonatos');

            const corridaFormatadaResposta = formatarCorridaOficialResposta(corridaFormatada);

            return res.status(201).json(new ApiResponse(true, 'Corrida oficial criada com sucesso', corridaFormatadaResposta));

        } catch (error) {
            console.error('Erro ao criar corrida oficial:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async getAll(req, res) {
        try {
            const corridasOficiais = await CorridaOficial.find()
                .populate('usuarios', 'nome email')
                .populate('usuarioRegistroId', 'nome email')
                .populate('competicao', 'nome grids campeonatos')
                .sort({ dataCorrida: -1 });

            const corridasFormatadas = corridasOficiais.map(formatarCorridaOficialResposta);

            return res.status(200).json(new ApiResponse(true, 'Corridas oficiais listadas com sucesso', corridasFormatadas));

        } catch (error) {
            console.error('Erro ao listar corridas oficiais:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json(new ApiResponse(false, 'ID da corrida oficial é obrigatório', null, { error: 'ID não fornecido' }));
            }

            const corridaOficial = await CorridaOficial.findById(id)
                .populate('usuarios', 'nome email')
                .populate('usuarioRegistroId', 'nome email')
                .populate('competicao', 'nome grids campeonatos');

            if (!corridaOficial) {
                return res.status(404).json(new ApiResponse(false, 'Corrida oficial não encontrada', null, { error: 'Corrida oficial não existe' }));
            }

            const corridaFormatada = formatarCorridaOficialResposta(corridaOficial);

            return res.status(200).json(new ApiResponse(true, 'Corrida oficial encontrada com sucesso', corridaFormatada));

        } catch (error) {
            console.error('Erro ao buscar corrida oficial:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { dataCorrida, usuarios, competicao } = req.body;
            const usuarioEdicaoId = req.user.id;

            if (!id) {
                return res.status(400).json(new ApiResponse(false, 'ID da corrida oficial é obrigatório', null, { error: 'ID não fornecido' }));
            }

            // Verificar se corrida oficial existe
            const corridaExistente = await CorridaOficial.findById(id);
            if (!corridaExistente) {
                return res.status(404).json(new ApiResponse(false, 'Corrida oficial não encontrada', null, { error: 'Corrida oficial não existe' }));
            }

            // Verificar se usuário existe
            const usuario = await Usuario.findById(usuarioEdicaoId);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado', null, { error: 'Usuário que está editando não existe' }));
            }

            const updateData = { usuarioEdicaoId };

            if (dataCorrida !== undefined) {
                if (isNaN(Date.parse(dataCorrida))) {
                    return res.status(400).json(new ApiResponse(false, 'Data da corrida inválida', null, { error: 'Formato de data inválido' }));
                }
                updateData.dataCorrida = dataCorrida;
            }
            if (usuarios !== undefined) {
                if (!Array.isArray(usuarios) || usuarios.length === 0) {
                    return res.status(400).json(new ApiResponse(false, 'Usuários deve ser um array não vazio', null, { error: 'Campo usuarios deve ser um array' }));
                }
                
                // Verificar se todos os usuários participantes existem
                const usuariosExistentes = await Usuario.find({ _id: { $in: usuarios } });
                if (usuariosExistentes.length !== usuarios.length) {
                    return res.status(404).json(new ApiResponse(false, 'Um ou mais usuários não encontrados', null, { error: 'Alguns usuários participantes não existem' }));
                }
                
                updateData.usuarios = usuarios;
            }
            if (competicao !== undefined) {
                // Verificar se competição existe
                const competicaoExistente = await Competicao.findById(competicao);
                if (!competicaoExistente) {
                    return res.status(404).json(new ApiResponse(false, 'Competição não encontrada', null, { error: 'Competição não existe' }));
                }
                updateData.competicao = competicao;
            }

            const corridaOficial = await CorridaOficial.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            )
            .populate('usuarios', 'nome email')
            .populate('usuarioRegistroId', 'nome email')
            .populate('competicao', 'nome grids campeonatos');

            const corridaFormatada = formatarCorridaOficialResposta(corridaOficial);

            return res.status(200).json(new ApiResponse(true, 'Corrida oficial atualizada com sucesso', corridaFormatada));

        } catch (error) {
            console.error('Erro ao atualizar corrida oficial:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json(new ApiResponse(false, 'ID da corrida oficial é obrigatório', null, { error: 'ID não fornecido' }));
            }

            const corridaOficial = await CorridaOficial.findById(id);
            if (!corridaOficial) {
                return res.status(404).json(new ApiResponse(false, 'Corrida oficial não encontrada', null, { error: 'Corrida oficial não existe' }));
            }

            await CorridaOficial.findByIdAndDelete(id);

            return res.status(200).json(new ApiResponse(true, 'Corrida oficial excluída com sucesso', null));

        } catch (error) {
            console.error('Erro ao excluir corrida oficial:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    }
};

module.exports = CorridaOficialController; 