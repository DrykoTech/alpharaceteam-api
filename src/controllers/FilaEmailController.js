const FilaEmail = require('../models/FilaEmail');
const emailQueueService = require('../services/EmailQueueService');
const ApiResponse = require('../models/ApiResponse');

class FilaEmailController {
    /**
     * Obtém estatísticas da fila de e-mails
     */
    async obterEstatisticas(req, res) {
        try {
            const estatisticas = await emailQueueService.obterEstatisticas();
            
            const response = new ApiResponse(
                true,
                'Estatísticas obtidas com sucesso',
                estatisticas
            );
            
            return res.status(200).json(response);
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            
            const response = new ApiResponse(
                false,
                'Erro ao obter estatísticas da fila de e-mails',
                null,
                error.message
            );
            
            return res.status(500).json(response);
        }
    }

    /**
     * Lista e-mails da fila com paginação
     */
    async listarEmails(req, res) {
        try {
            const { 
                pagina = 1, 
                limite = 20, 
                status, 
                destinatario,
                dataInicio,
                dataFim 
            } = req.query;

            const filtro = {};
            
            if (status) {
                filtro.status = status;
            }
            
            if (destinatario) {
                filtro.destinatario = { $regex: destinatario, $options: 'i' };
            }
            
            if (dataInicio || dataFim) {
                filtro.dataCriacao = {};
                if (dataInicio) filtro.dataCriacao.$gte = new Date(dataInicio);
                if (dataFim) filtro.dataCriacao.$lte = new Date(dataFim);
            }

            const skip = (parseInt(pagina) - 1) * parseInt(limite);
            
            const [emails, total] = await Promise.all([
                FilaEmail.find(filtro)
                    .sort({ dataCriacao: -1 })
                    .skip(skip)
                    .limit(parseInt(limite))
                    .select('-__v'),
                FilaEmail.countDocuments(filtro)
            ]);

            const totalPaginas = Math.ceil(total / parseInt(limite));
            
            const response = new ApiResponse(
                true,
                'E-mails listados com sucesso',
                {
                    emails,
                    paginacao: {
                        pagina: parseInt(pagina),
                        limite: parseInt(limite),
                        total,
                        totalPaginas
                    }
                }
            );
            
            return res.status(200).json(response);
        } catch (error) {
            console.error('Erro ao listar e-mails:', error);
            
            const response = new ApiResponse(
                false,
                'Erro ao listar e-mails da fila',
                null,
                error.message
            );
            
            return res.status(500).json(response);
        }
    }

    /**
     * Obtém detalhes de um e-mail específico
     */
    async obterEmail(req, res) {
        try {
            const { id } = req.params;
            
            const email = await FilaEmail.findById(id).select('-__v');
            
            if (!email) {
                const response = new ApiResponse(
                    false,
                    'E-mail não encontrado',
                    null
                );
                return res.status(404).json(response);
            }
            
            const response = new ApiResponse(
                true,
                'E-mail obtido com sucesso',
                email
            );
            
            return res.status(200).json(response);
        } catch (error) {
            console.error('Erro ao obter e-mail:', error);
            
            const response = new ApiResponse(
                false,
                'Erro ao obter e-mail',
                null,
                error.message
            );
            
            return res.status(500).json(response);
        }
    }

    /**
     * Reprocessa um e-mail específico
     */
    async reprocessarEmail(req, res) {
        try {
            const { id } = req.params;
            
            const email = await FilaEmail.findById(id);
            
            if (!email) {
                const response = new ApiResponse(
                    false,
                    'E-mail não encontrado',
                    null
                );
                return res.status(404).json(response);
            }
            
            // Reseta o e-mail para reprocessamento
            email.status = 'Pendente';
            email.tentativas = 0;
            email.erro = null;
            email.proximaTentativa = null;
            await email.save();
            
            const response = new ApiResponse(
                true,
                'E-mail marcado para reprocessamento',
                { id: email._id }
            );
            
            return res.status(200).json(response);
        } catch (error) {
            console.error('Erro ao reprocessar e-mail:', error);
            
            const response = new ApiResponse(
                false,
                'Erro ao reprocessar e-mail',
                null,
                error.message
            );
            
            return res.status(500).json(response);
        }
    }

    /**
     * Cancela um e-mail pendente
     */
    async cancelarEmail(req, res) {
        try {
            const { id } = req.params;
            
            const email = await FilaEmail.findById(id);
            
            if (!email) {
                const response = new ApiResponse(
                    false,
                    'E-mail não encontrado',
                    null
                );
                return res.status(404).json(response);
            }
            
            if (email.status !== 'Pendente') {
                const response = new ApiResponse(
                    false,
                    'Apenas e-mails pendentes podem ser cancelados',
                    null
                );
                return res.status(400).json(response);
            }
            
            email.status = 'Cancelado';
            await email.save();
            
            const response = new ApiResponse(
                true,
                'E-mail cancelado com sucesso',
                { id: email._id }
            );
            
            return res.status(200).json(response);
        } catch (error) {
            console.error('Erro ao cancelar e-mail:', error);
            
            const response = new ApiResponse(
                false,
                'Erro ao cancelar e-mail',
                null,
                error.message
            );
            
            return res.status(500).json(response);
        }
    }

    /**
     * Força o processamento da fila
     */
    async processarFila(req, res) {
        try {
            // Processa a fila de forma assíncrona
            emailQueueService.processarFila().catch(error => {
                console.error('Erro no processamento da fila:', error);
            });
            
            const response = new ApiResponse(
                true,
                'Processamento da fila iniciado',
                null
            );
            
            return res.status(200).json(response);
        } catch (error) {
            console.error('Erro ao iniciar processamento:', error);
            
            const response = new ApiResponse(
                false,
                'Erro ao iniciar processamento da fila',
                null,
                error.message
            );
            
            return res.status(500).json(response);
        }
    }

    /**
     * Limpa e-mails antigos
     */
    async limparEmailsAntigos(req, res) {
        try {
            const { dias = 30 } = req.body;
            
            const quantidadeRemovida = await emailQueueService.limparEmailsAntigos(dias);
            
            const response = new ApiResponse(
                true,
                'Limpeza concluída com sucesso',
                { quantidadeRemovida }
            );
            
            return res.status(200).json(response);
        } catch (error) {
            console.error('Erro ao limpar e-mails antigos:', error);
            
            const response = new ApiResponse(
                false,
                'Erro ao limpar e-mails antigos',
                null,
                error.message
            );
            
            return res.status(500).json(response);
        }
    }

    /**
     * Obtém logs de processamento recentes
     */
    async obterLogsProcessamento(req, res) {
        try {
            const { limite = 50 } = req.query;
            
            const emails = await FilaEmail.find({
                $or: [
                    { status: 'Enviado' },
                    { status: 'Erro' }
                ]
            })
            .sort({ dataEnvio: -1, dataCriacao: -1 })
            .limit(parseInt(limite))
            .select('destinatario assunto status tentativas dataEnvio erro dataCriacao');
            
            const response = new ApiResponse(
                true,
                'Logs obtidos com sucesso',
                emails
            );
            
            return res.status(200).json(response);
        } catch (error) {
            console.error('Erro ao obter logs:', error);
            
            const response = new ApiResponse(
                false,
                'Erro ao obter logs de processamento',
                null,
                error.message
            );
            
            return res.status(500).json(response);
        }
    }
}

module.exports = new FilaEmailController(); 