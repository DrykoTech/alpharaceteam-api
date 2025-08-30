const Usuario = require('../models/Usuario');
const { Endereco } = require('../models/Endereco');
const bcrypt = require('bcryptjs');

const PerfilUsuario = require('../utils/PerfilUsuario');
const { formatarDataBrasileira, obterDataAtual } = require('../utils/DateFormatter');

const ApiResponse = require('../models/ApiResponse');
const { enviarEmailCadastro } = require('../config/emailService');
const cloudinary = require('../config/cloudinary');

// Função para remover senha e formatar datas
const formatarUsuarioResposta = (usuario) => {
    const usuarioObj = usuario.toObject();
    delete usuarioObj.senha;
    
    // Formatar datas no formato brasileiro
    if (usuarioObj.dataNascimento) {
        usuarioObj.dataNascimento = formatarDataBrasileira(usuarioObj.dataNascimento);
    }
    if (usuarioObj.createdAt) {
        usuarioObj.createdAt = formatarDataBrasileira(usuarioObj.createdAt);
    }
    if (usuarioObj.updatedAt) {
        usuarioObj.updatedAt = formatarDataBrasileira(usuarioObj.updatedAt);
    }
    
    return usuarioObj;
};

const UsuarioController = {
    async create(req, res) {
        try {
            const { 
                nome, 
                dataNascimento, 
                telefone, 
                email, 
                senha, 
                psnId, 
                fotoPerfil, 
                fotoCard, // Adicionado
                volante, 
                nivel, 
                perfil, 
                plataforma,
                simulador,
                ativo
            } = req.body;

            // Validação de campos obrigatórios
            if (!nome || !dataNascimento || !telefone || !email || !senha || !psnId || !volante || !nivel || !perfil || !plataforma || !simulador || ativo === undefined) {
                return res.status(400).json(
                    new ApiResponse(false, 'Todos os campos obrigatórios devem ser preenchidos',
                        null,
                        { error: 'Campos obrigatórios: nome, dataNascimento, telefone, email, senha, psnId, volante, nivel, perfil, plataforma, simulador, ativo' })
                );
            }

            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                return res.status(400).json(new ApiResponse(false, 'Email inválido', null, { error: 'Formato de email inválido' }));
            }

            // Validação de data
            if (isNaN(Date.parse(dataNascimento))) {
                return res.status(400).json(new ApiResponse(false, 'Data de nascimento inválida', null, { error: 'Formato de data inválido' }));
            }

            // Validação do perfil
            const perfilValido = Object.values(PerfilUsuario).includes(perfil);
            
            if (!perfilValido) {
                return res.status(400).json(new ApiResponse(false, 'Perfil de usuário inválido', null, { error: 'Perfil deve ser um dos valores: ' + Object.values(PerfilUsuario).join(', ') }));
            }

            // Validação do simulador
            if (!Array.isArray(simulador) || simulador.length === 0) {
                return res.status(400).json(new ApiResponse(false, 'Simulador deve ser um array não vazio', null, { error: 'Campo simulador é obrigatório e deve ser um array' }));
            }

            // Validação do campo ativo
            if (typeof ativo !== 'boolean') {
                return res.status(400).json(new ApiResponse(false, 'Campo ativo deve ser um valor booleano', null, { error: 'Campo ativo deve ser true ou false' }));
            }

            const hashedPassword = await bcrypt.hash(senha, 10);

            const usuario = new Usuario({
                nome,
                dataNascimento,
                telefone,
                email,
                senha: hashedPassword,
                psnId,
                fotoPerfil,
                fotoCard, // Adicionado
                volante,
                nivel,
                perfil,
                plataforma,
                simulador,
                ativo,
                createdAt: obterDataAtual(),
                updatedAt: obterDataAtual(),
                usuarioEdicaoId: req.usuario?.id // Se houver usuário logado, usa o ID dele
            });

            await usuario.save();

            // Enviar e-mail de boas-vindas (assíncrono)
            try {
                await enviarEmailCadastro({
                    nome: usuario.nome,
                    email: usuario.email,
                    senha: senha // Senha original para o e-mail
                });
            } catch (emailError) {
                console.error('Erro ao enviar e-mail de cadastro:', emailError);
                // Não falha a criação do usuário se o e-mail falhar
            }

            const usuarioFormatado = formatarUsuarioResposta(usuario);
            return res.status(201).json(new ApiResponse(true, 'Usuário criado com sucesso', usuarioFormatado));
        } catch (err) {
            return res.status(400).json(new ApiResponse(false, 'Erro ao criar usuário', null, { error: err.message }));
        }
    },

    async getAll(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
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
            
            if (nome) {
                filter.nome = { $regex: nome, $options: 'i' }; // Busca case-insensitive
            }
            
            if (psnId) {
                filter.psnId = { $regex: psnId, $options: 'i' }; // Busca case-insensitive
            }

            // Calcular skip para paginação
            const skip = (pageNumber - 1) * limitNumber;

            // Buscar usuários com filtros e paginação
            const usuarios = await Usuario.find(filter)
                .skip(skip)
                .limit(limitNumber)
                .sort({ createdAt: -1 }); // Ordenar por data de criação (mais recentes primeiro)

            // Contar total de documentos para paginação
            const total = await Usuario.countDocuments(filter);

            // Calcular informações de paginação
            const totalPages = Math.ceil(total / limitNumber);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;

            // Formatar usuários
            const usuariosFormatados = usuarios.map(usuario => formatarUsuarioResposta(usuario));

            // Construir resposta com metadados de paginação
            const response = {
                usuarios: usuariosFormatados,
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

            return res.status(200).json(new ApiResponse(true, 'Usuários encontrados', response));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar usuários', null, { error: err.message }));
        }
    },

    async getById(req, res) {
        try {
            const usuario = await Usuario.findById(req.params.id);
            if (!usuario) return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            
            // Buscar endereços vinculados ao usuário
            const enderecos = await Endereco.find({ usuarioId: req.params.id });
            
            // Formatar endereços (remover campos sensíveis e formatar datas)
            const enderecosFormatados = enderecos.map(endereco => {
                const enderecoObj = endereco.toObject();
                if (enderecoObj.createdAt) {
                    enderecoObj.createdAt = formatarDataBrasileira(enderecoObj.createdAt);
                }
                if (enderecoObj.updatedAt) {
                    enderecoObj.updatedAt = formatarDataBrasileira(enderecoObj.updatedAt);
                }
                return enderecoObj;
            });
            
            const usuarioFormatado = formatarUsuarioResposta(usuario);
            
            // Adicionar endereços ao objeto de resposta
            const respostaCompleta = {
                ...usuarioFormatado,
                enderecos: enderecosFormatados
            };
            
            return res.status(200).json(new ApiResponse(true, 'Usuário encontrado', respostaCompleta));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao buscar usuário', null, { error: err.message }));
        }
    },

    async update(req, res) {
        try {
            const { senha, ...rest } = req.body;
            let updateData = { ...rest };
            
            // Adicionar updatedAt com a data atual
            updateData.updatedAt = obterDataAtual();
            // Adicionar usuarioEdicaoId com o ID do usuário logado
            updateData.usuarioEdicaoId = req.usuario.id;
            
            if (senha) {
                updateData.senha = await bcrypt.hash(senha, 10);
            }
            
            const usuario = await Usuario.findByIdAndUpdate(req.params.id, updateData, { new: true });
            if (!usuario) return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            
            const usuarioFormatado = formatarUsuarioResposta(usuario);
            return res.status(200).json(new ApiResponse(true, 'Usuário atualizado com sucesso', usuarioFormatado));
        } catch (err) {
            return res.status(400).json(new ApiResponse(false, 'Erro ao atualizar usuário', null, { error: err.message }));
        }
    },

    async delete(req, res) {
        try {
            const usuario = await Usuario.findByIdAndDelete(req.params.id);
            if (!usuario) return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            return res.status(200).json(new ApiResponse(true, 'Usuário deletado com sucesso'));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao deletar usuário', null, { error: err.message }));
        }
    },

    async uploadPerfil(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json(new ApiResponse(false, 'Nenhuma imagem enviada'));
            }
            const result = await cloudinary.uploader.upload_stream({
                folder: 'usuarios/perfil',
                resource_type: 'image',
                public_id: `${Date.now()}_perfil`,
                overwrite: true
            }, (error, result) => {
                if (error) {
                    return res.status(500).json(new ApiResponse(false, 'Erro ao enviar imagem para o Cloudinary', null, { error: error.message }));
                }
                return res.status(200).json(new ApiResponse(true, 'Upload realizado com sucesso', { url: result.secure_url }));
            });
            result.end(req.file.buffer);
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao fazer upload', null, { error: err.message }));
        }
    },

    async uploadCard(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json(new ApiResponse(false, 'Nenhuma imagem enviada'));
            }
            const result = await cloudinary.uploader.upload_stream({
                folder: 'usuarios/card',
                resource_type: 'image',
                public_id: `${Date.now()}_card`,
                overwrite: true
            }, (error, result) => {
                if (error) {
                    return res.status(500).json(new ApiResponse(false, 'Erro ao enviar imagem para o Cloudinary', null, { error: error.message }));
                }
                return res.status(200).json(new ApiResponse(true, 'Upload realizado com sucesso', { url: result.secure_url }));
            });
            result.end(req.file.buffer);
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao fazer upload', null, { error: err.message }));
        }
    },

    async toggleAtivo(req, res) {
        try {
            const { ativo } = req.body;

            // Validação do campo ativo
            if (typeof ativo !== 'boolean') {
                return res.status(400).json(new ApiResponse(false, 'Campo ativo deve ser um valor booleano', null, { error: 'Campo ativo deve ser true ou false' }));
            }

            const usuario = await Usuario.findById(req.params.id);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            }

            // Atualizar apenas o campo ativo
            usuario.ativo = ativo;
            usuario.updatedAt = obterDataAtual();
            usuario.usuarioEdicaoId = req.usuario?.id;
            
            await usuario.save();

            const usuarioFormatado = formatarUsuarioResposta(usuario);
            const statusText = ativo ? 'ativado' : 'desativado';
            
            return res.status(200).json(new ApiResponse(true, `Usuário ${statusText} com sucesso`, usuarioFormatado));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao alterar status do usuário', null, { error: err.message }));
        }
    },

    async alterarSenha(req, res) {
        try {
            const { senhaAtual, novaSenha } = req.body;

            // Validação dos campos obrigatórios
            if (!senhaAtual || !novaSenha) {
                return res.status(400).json(new ApiResponse(false, 'Senha atual e nova senha são obrigatórias', null, { error: 'Campos obrigatórios: senhaAtual, novaSenha' }));
            }

            // Validação da nova senha (mínimo 6 caracteres)
            if (novaSenha.length < 6) {
                return res.status(400).json(new ApiResponse(false, 'Nova senha deve ter pelo menos 6 caracteres', null, { error: 'Senha muito curta' }));
            }

            const usuario = await Usuario.findById(req.params.id);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            }

            // Verificar se a senha atual está correta
            const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
            if (!senhaCorreta) {
                return res.status(400).json(new ApiResponse(false, 'Senha atual incorreta', null, { error: 'Senha atual não confere' }));
            }

            // Verificar se a nova senha é diferente da atual
            const novaSenhaIgual = await bcrypt.compare(novaSenha, usuario.senha);
            if (novaSenhaIgual) {
                return res.status(400).json(new ApiResponse(false, 'Nova senha deve ser diferente da senha atual', null, { error: 'Nova senha igual à atual' }));
            }

            // Criptografar e salvar a nova senha usando findByIdAndUpdate para evitar validação desnecessária
            const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
            
            const usuarioAtualizado = await Usuario.findByIdAndUpdate(
                req.params.id,
                {
                    senha: novaSenhaHash,
                    updatedAt: obterDataAtual(),
                    usuarioEdicaoId: req.usuario?.id
                },
                { 
                    new: true,
                    runValidators: false // Desabilita validação para evitar problemas com campos obrigatórios
                }
            );

            const usuarioFormatado = formatarUsuarioResposta(usuarioAtualizado);
            
            return res.status(200).json(new ApiResponse(true, 'Senha alterada com sucesso', usuarioFormatado));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao alterar senha', null, { error: err.message }));
        }
    }
};

module.exports = UsuarioController; 