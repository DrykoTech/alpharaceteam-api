const { Falta } = require('../models/Falta');
const { TreinoOficial } = require('../models/TreinoOficial');
const { CorridaOficial } = require('../models/CorridaOficial');
const ApiResponse = require('../models/ApiResponse');
const { formatarDataBrasileira } = require('../utils/DateFormatter');

const formatarFaltaResposta = (falta) => {
    const faltaObj = falta.toObject();
    
    // Formatar datas no formato brasileiro
    if (faltaObj.dataCadastro) {
        faltaObj.dataCadastro = formatarDataBrasileira(faltaObj.dataCadastro);
    }
    if (faltaObj.dataAlteracao) {
        faltaObj.dataAlteracao = formatarDataBrasileira(faltaObj.dataAlteracao);
    }
    
    return faltaObj;
};

const FaltaController = {
    async create(req, res) {
        try {
            if (!req.body) {
                return res.status(400).json(new ApiResponse(false, 'Dados da requisição são obrigatórios'));
            }

            const { referenciaId, tipoFalta, usuarioId, tipo, justificativa } = req.body;

            // Validar se a referência existe
            let referenciaExiste = false;
            if (tipoFalta === 'TREINO') {
                const treinoOficial = await TreinoOficial.findById(referenciaId);
                referenciaExiste = !!treinoOficial;
            } else if (tipoFalta === 'CAMPEONATO') {
                const corridaOficial = await CorridaOficial.findById(referenciaId);
                referenciaExiste = !!corridaOficial;
            }

            if (!referenciaExiste) {
                return res.status(400).json(new ApiResponse(false, 'Referência não encontrada'));
            }

            const falta = new Falta({
                referenciaId,
                tipoFalta,
                usuarioId,
                tipo,
                justificativa: justificativa || '',
                usuarioRegistroId: req.usuario.id,
                usuarioEdicaoId: req.usuario.id
            });

            await falta.save();

            const faltaFormatada = formatarFaltaResposta(falta);
            return res.status(201).json(new ApiResponse(true, 'Falta registrada com sucesso', faltaFormatada));
        } catch (err) {
            return res.status(400).json(new ApiResponse(false, 'Erro ao registrar falta', null, { error: err.message }));
        }
    },

    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, usuarioId, tipoFalta, tipo } = req.query;
            
            const pageNum = parseInt(page);
            const limitNum = Math.min(parseInt(limit), 100);
            const skip = (pageNum - 1) * limitNum;

            // Construir filtros
            const filtros = {};
            if (usuarioId) filtros.usuarioId = usuarioId;
            if (tipoFalta) filtros.tipoFalta = tipoFalta;
            if (tipo) filtros.tipo = tipo;

            const faltas = await Falta.find(filtros)
                .populate('usuarioId', 'nome psnId')
                .populate('usuarioRegistroId', 'nome')
                .populate('usuarioEdicaoId', 'nome')
                .sort({ dataCadastro: -1 })
                .skip(skip)
                .limit(limitNum);

            const total = await Falta.countDocuments(filtros);
            const totalPages = Math.ceil(total / limitNum);

            const faltasFormatadas = faltas.map(falta => formatarFaltaResposta(falta));

            const pagination = {
                currentPage: pageNum,
                totalPages,
                totalItems: total,
                itemsPerPage: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                nextPage: pageNum < totalPages ? pageNum + 1 : null,
                prevPage: pageNum > 1 ? pageNum - 1 : null
            };

            return res.status(200).json(new ApiResponse(true, 'Faltas encontradas', {
                faltas: faltasFormatadas,
                pagination
            }));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar faltas', null, { error: err.message }));
        }
    },

    async getById(req, res) {
        try {
            const falta = await Falta.findById(req.params.id)
                .populate('usuarioId', 'nome psnId')
                .populate('usuarioRegistroId', 'nome')
                .populate('usuarioEdicaoId', 'nome');

            if (!falta) {
                return res.status(404).json(new ApiResponse(false, 'Falta não encontrada'));
            }

            const faltaFormatada = formatarFaltaResposta(falta);
            return res.status(200).json(new ApiResponse(true, 'Falta encontrada', faltaFormatada));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar falta', null, { error: err.message }));
        }
    },

    async update(req, res) {
        try {
            const { tipo, justificativa } = req.body;
            
            const updateData = {
                tipo,
                justificativa: justificativa || '',
                usuarioEdicaoId: req.usuario.id
            };

            const falta = await Falta.findByIdAndUpdate(req.params.id, updateData, { new: true })
                .populate('usuarioId', 'nome psnId')
                .populate('usuarioRegistroId', 'nome')
                .populate('usuarioEdicaoId', 'nome');

            if (!falta) {
                return res.status(404).json(new ApiResponse(false, 'Falta não encontrada'));
            }

            const faltaFormatada = formatarFaltaResposta(falta);
            return res.status(200).json(new ApiResponse(true, 'Falta atualizada com sucesso', faltaFormatada));
        } catch (err) {
            return res.status(400).json(new ApiResponse(false, 'Erro ao atualizar falta', null, { error: err.message }));
        }
    },

    async delete(req, res) {
        try {
            const falta = await Falta.findByIdAndDelete(req.params.id);

            if (!falta) {
                return res.status(404).json(new ApiResponse(false, 'Falta não encontrada'));
            }

            return res.status(200).json(new ApiResponse(true, 'Falta deletada com sucesso'));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao deletar falta', null, { error: err.message }));
        }
    },

    async getByUsuario(req, res) {
        try {
            const { usuarioId } = req.params;
            const { tipoFalta } = req.query;

            if (!usuarioId) {
                return res.status(400).json(new ApiResponse(false, 'ID do usuário é obrigatório'));
            }

            const filtros = { usuarioId };
            if (tipoFalta) filtros.tipoFalta = tipoFalta;

            const faltas = await Falta.find(filtros)
                .populate('usuarioId', 'nome psnId')
                .populate('usuarioRegistroId', 'nome')
                .populate('usuarioEdicaoId', 'nome')
                .sort({ dataCadastro: -1 });

            if (faltas.length === 0) {
                return res.status(200).json(new ApiResponse(true, 'Nenhuma falta encontrada para este usuário', []));
            }

            const faltasFormatadas = faltas.map(falta => formatarFaltaResposta(falta));

            return res.status(200).json(new ApiResponse(true, 'Faltas do usuário encontradas', faltasFormatadas));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar faltas do usuário', null, { error: err.message }));
        }
    },

    async getByReferencia(req, res) {
        try {
            const { referenciaId, tipoFalta } = req.params;

            if (!referenciaId || !tipoFalta) {
                return res.status(400).json(new ApiResponse(false, 'ID da referência e tipo de falta são obrigatórios'));
            }

            const faltas = await Falta.find({ referenciaId, tipoFalta })
                .populate('usuarioId', 'nome psnId')
                .populate('usuarioRegistroId', 'nome')
                .populate('usuarioEdicaoId', 'nome')
                .sort({ dataCadastro: -1 });

            if (faltas.length === 0) {
                return res.status(200).json(new ApiResponse(true, 'Nenhuma falta encontrada para esta referência', []));
            }

            const faltasFormatadas = faltas.map(falta => formatarFaltaResposta(falta));

            return res.status(200).json(new ApiResponse(true, 'Faltas da referência encontradas', faltasFormatadas));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar faltas da referência', null, { error: err.message }));
        }
    }
};

module.exports = FaltaController; 