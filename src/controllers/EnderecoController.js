const { Endereco } = require('../models/Endereco');
const ApiResponse = require('../models/ApiResponse');
const { formatarDataBrasileira, obterDataAtual } = require('../utils/DateFormatter');

// Função para formatar datas do endereço
const formatarEnderecoResposta = (endereco) => {
    const enderecoObj = endereco.toObject();
    
    // Formatar datas no formato brasileiro
    if (enderecoObj.createdAt) {
        enderecoObj.createdAt = formatarDataBrasileira(enderecoObj.createdAt);
    }
    if (enderecoObj.updatedAt) {
        enderecoObj.updatedAt = formatarDataBrasileira(enderecoObj.updatedAt);
    }
    
    return enderecoObj;
};

const EnderecoController = {
    async create(req, res) {
        try {
            const { usuarioId, rua, numero, bairro, cidade, estado, cep, pais } = req.body;

            if (!usuarioId || !rua || !numero || !bairro || !cidade || !estado || !cep || !pais) {
                return res.status(400).json(new ApiResponse(false, 'Todos os campos obrigatórios devem ser preenchidos'));
            }

            const endereco = new Endereco({ 
                usuarioId, 
                rua, 
                numero, 
                bairro, 
                cidade, 
                estado, 
                cep, 
                pais,
                createdAt: obterDataAtual(),
                updatedAt: obterDataAtual(),
                usuarioEdicaoId: req.usuario.id
            });

            await endereco.save();

            const enderecoFormatado = formatarEnderecoResposta(endereco);
            return res.status(201).json(new ApiResponse(true, 'Endereço criado com sucesso', enderecoFormatado));
        } catch (err) {
            return res.status(400).json(new ApiResponse(false, 'Erro ao criar endereço', null, { error: err.message }));
        }
    },

    async getAll(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                usuarioId, 
                cidade, 
                estado,
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
            
            if (cidade) {
                filter.cidade = { $regex: cidade, $options: 'i' }; // Busca case-insensitive
            }
            
            if (estado) {
                filter.estado = { $regex: estado, $options: 'i' }; // Busca case-insensitive
            }

            // Calcular skip para paginação
            const skip = (pageNumber - 1) * limitNumber;

            // Buscar endereços com filtros e paginação
            let enderecos = await Endereco.find(filter)
                .populate('usuarioId', 'nome psnId')
                .skip(skip)
                .limit(limitNumber)
                .sort({ createdAt: -1 }); // Ordenar por data de criação (mais recentes primeiro)

            // Filtrar por nome e psnId do usuário se fornecidos
            if (nome || psnId) {
                enderecos = enderecos.filter(endereco => {
                    const usuario = endereco.usuarioId;
                    if (!usuario) return false;
                    
                    const nomeMatch = !nome || usuario.nome.toLowerCase().includes(nome.toLowerCase());
                    const psnIdMatch = !psnId || usuario.psnId.toLowerCase().includes(psnId.toLowerCase());
                    
                    return nomeMatch && psnIdMatch;
                });
            }

            // Contar total de documentos para paginação (sem filtros de nome/psnId)
            const total = await Endereco.countDocuments(filter);

            // Calcular informações de paginação
            const totalPages = Math.ceil(total / limitNumber);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;

            // Formatar endereços
            const enderecosFormatados = enderecos.map(endereco => formatarEnderecoResposta(endereco));

            // Construir resposta com metadados de paginação
            const response = {
                enderecos: enderecosFormatados,
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

            return res.status(200).json(new ApiResponse(true, 'Endereços encontrados', response));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar endereços', null, { error: err.message }));
        }
    },

    async getById(req, res) {
        try {
            const endereco = await Endereco.findById(req.params.id);

            if (!endereco) return res.status(404).json(new ApiResponse(false, 'Endereço não encontrado'));

            const enderecoFormatado = formatarEnderecoResposta(endereco);
            return res.status(200).json(new ApiResponse(true, 'Endereço encontrado', enderecoFormatado));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar endereço', null, { error: err.message }));
        }
    },

    async update(req, res) {
        try {
            let updateData = { ...req.body };
            
            // Adicionar updatedAt com a data atual
            updateData.updatedAt = obterDataAtual();
            // Adicionar usuarioEdicaoId com o ID do usuário logado
            updateData.usuarioEdicaoId = req.usuario.id;
            
            const endereco = await Endereco.findByIdAndUpdate(req.params.id, updateData, { new: true });

            if (!endereco) return res.status(404).json(new ApiResponse(false, 'Endereço não encontrado'));

            const enderecoFormatado = formatarEnderecoResposta(endereco);
            return res.status(200).json(new ApiResponse(true, 'Endereço atualizado com sucesso', enderecoFormatado));
        } catch (err) {
            return res.status(400).json(new ApiResponse(false, 'Erro ao atualizar endereço', null, { error: err.message }));
        }
    },

    async delete(req, res) {
        try {
            const endereco = await Endereco.findByIdAndDelete(req.params.id);

            if (!endereco) return res.status(404).json(new ApiResponse(false, 'Endereço não encontrado'));
            
            return res.status(200).json(new ApiResponse(true, 'Endereço deletado com sucesso'));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao deletar endereço', null, { error: err.message }));
        }
    },
    
    async getByUsuario(req, res) {
        try {
            const { usuarioId } = req.params;

            const enderecos = await Endereco.find({ usuarioId });

            if (!enderecos || enderecos.length === 0) {
                return res.status(200).json(new ApiResponse(false, 'Endereço não encontrado para este usuário', []));
            }
            
            const enderecosFormatados = enderecos.map(endereco => formatarEnderecoResposta(endereco));
            return res.status(200).json(new ApiResponse(true, 'Endereço(s) encontrado(s)', enderecosFormatados));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar endereço por usuário', null, { error: err.message }));
        }
    }
};

module.exports = EnderecoController; 