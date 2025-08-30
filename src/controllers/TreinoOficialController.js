const { TreinoOficial } = require('../models/TreinoOficial');
const Usuario = require('../models/Usuario');
const ApiResponse = require('../models/ApiResponse');
const { formatarDataBrasileira } = require('../utils/DateFormatter');

// Função para formatar resposta do treino oficial
const formatarTreinoOficialResposta = (treinoOficial) => {
    const treinoObj = treinoOficial.toObject();
    
    // Formatar datas no formato brasileiro
    if (treinoObj.dataTreino) {
        treinoObj.dataTreino = formatarDataBrasileira(treinoObj.dataTreino);
    }
    if (treinoObj.dataCadastro) {
        treinoObj.dataCadastro = formatarDataBrasileira(treinoObj.dataCadastro);
    }
    if (treinoObj.dataAlteracao) {
        treinoObj.dataAlteracao = formatarDataBrasileira(treinoObj.dataAlteracao);
    }
    
    return treinoObj;
};

const TreinoOficialController = {
    async create(req, res) {
        try {
            const { 
                dataTreino, 
                usuarios, 
                campeonato,
                simulador
            } = req.body;

            const usuarioRegistroId = req.user.id;

            // Validação de campos obrigatórios
            if (!dataTreino || !usuarios) {
                return res.status(400).json(
                    new ApiResponse(false, 'Todos os campos obrigatórios devem ser preenchidos',
                        null,
                        { error: 'Campos obrigatórios: dataTreino, usuarios' })
                );
            }

            // Validação de data
            if (isNaN(Date.parse(dataTreino))) {
                return res.status(400).json(new ApiResponse(false, 'Data do treino inválida', null, { error: 'Formato de data inválido' }));
            }

            // Validação de array de usuários
            if (!Array.isArray(usuarios) || usuarios.length === 0) {
                return res.status(400).json(new ApiResponse(false, 'Usuários deve ser um array não vazio', null, { error: 'Campo usuarios é obrigatório e deve ser um array' }));
            }

            // Verificar se usuário que está registrando existe
            const usuarioRegistro = await Usuario.findById(usuarioRegistroId);
            if (!usuarioRegistro) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado', null, { error: 'Usuário que está registrando o treino não existe' }));
            }

            // Verificar se todos os usuários participantes existem
            const usuariosExistentes = await Usuario.find({ _id: { $in: usuarios } });
            if (usuariosExistentes.length !== usuarios.length) {
                return res.status(404).json(new ApiResponse(false, 'Um ou mais usuários não encontrados', null, { error: 'Alguns usuários participantes não existem' }));
            }

            const treinoOficial = new TreinoOficial({
                dataTreino,
                usuarios,
                campeonato: campeonato || '',
                simulador: simulador || '',
                usuarioRegistroId
            });

            await treinoOficial.save();

            const treinoFormatado = await TreinoOficial.findById(treinoOficial._id)
                .populate('usuarios', 'nome email')
                .populate('usuarioRegistroId', 'nome email');

            const treinoFormatadoResposta = formatarTreinoOficialResposta(treinoFormatado);

            return res.status(201).json(new ApiResponse(true, 'Treino oficial criado com sucesso', treinoFormatadoResposta));

        } catch (error) {
            console.error('Erro ao criar treino oficial:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async getAll(req, res) {
        try {
            const treinosOficiais = await TreinoOficial.find()
                .populate('usuarios', 'nome email')
                .populate('usuarioRegistroId', 'nome email')
                .sort({ dataTreino: -1 });

            const treinosFormatados = treinosOficiais.map(formatarTreinoOficialResposta);

            return res.status(200).json(new ApiResponse(true, 'Treinos oficiais listados com sucesso', treinosFormatados));

        } catch (error) {
            console.error('Erro ao listar treinos oficiais:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json(new ApiResponse(false, 'ID do treino oficial é obrigatório', null, { error: 'ID não fornecido' }));
            }

            const treinoOficial = await TreinoOficial.findById(id)
                .populate('usuarios', 'nome email')
                .populate('usuarioRegistroId', 'nome email');

            if (!treinoOficial) {
                return res.status(404).json(new ApiResponse(false, 'Treino oficial não encontrado', null, { error: 'Treino oficial não existe' }));
            }

            const treinoFormatado = formatarTreinoOficialResposta(treinoOficial);

            return res.status(200).json(new ApiResponse(true, 'Treino oficial encontrado com sucesso', treinoFormatado));

        } catch (error) {
            console.error('Erro ao buscar treino oficial:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { dataTreino, usuarios, campeonato, simulador } = req.body;
            const usuarioEdicaoId = req.user.id;

            if (!id) {
                return res.status(400).json(new ApiResponse(false, 'ID do treino oficial é obrigatório', null, { error: 'ID não fornecido' }));
            }

            // Verificar se treino oficial existe
            const treinoExistente = await TreinoOficial.findById(id);
            if (!treinoExistente) {
                return res.status(404).json(new ApiResponse(false, 'Treino oficial não encontrado', null, { error: 'Treino oficial não existe' }));
            }

            // Verificar se usuário existe
            const usuario = await Usuario.findById(usuarioEdicaoId);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado', null, { error: 'Usuário que está editando não existe' }));
            }

            const updateData = { usuarioEdicaoId };

            if (dataTreino !== undefined) {
                if (isNaN(Date.parse(dataTreino))) {
                    return res.status(400).json(new ApiResponse(false, 'Data do treino inválida', null, { error: 'Formato de data inválido' }));
                }
                updateData.dataTreino = dataTreino;
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
            if (campeonato !== undefined) {
                updateData.campeonato = campeonato;
            }
            if (simulador !== undefined) {
                updateData.simulador = simulador;
            }

            const treinoOficial = await TreinoOficial.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            )
            .populate('usuarios', 'nome email')
            .populate('usuarioRegistroId', 'nome email');

            const treinoFormatado = formatarTreinoOficialResposta(treinoOficial);

            return res.status(200).json(new ApiResponse(true, 'Treino oficial atualizado com sucesso', treinoFormatado));

        } catch (error) {
            console.error('Erro ao atualizar treino oficial:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json(new ApiResponse(false, 'ID do treino oficial é obrigatório', null, { error: 'ID não fornecido' }));
            }

            const treinoOficial = await TreinoOficial.findById(id);
            if (!treinoOficial) {
                return res.status(404).json(new ApiResponse(false, 'Treino oficial não encontrado', null, { error: 'Treino oficial não existe' }));
            }

            await TreinoOficial.findByIdAndDelete(id);

            return res.status(200).json(new ApiResponse(true, 'Treino oficial excluído com sucesso', null));

        } catch (error) {
            console.error('Erro ao excluir treino oficial:', error);
            return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: error.message }));
        }
    }
};

module.exports = TreinoOficialController; 