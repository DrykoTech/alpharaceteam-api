const FilaEmail = require('../models/FilaEmail');

const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

// Verificar se a API key está disponível
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY não encontrada. E-mails não serão enviados.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

class EmailQueueService {
    constructor() {
        this.isProcessing = false;
        this.processingInterval = null;
    }

    /**
     * Adiciona um e-mail à fila
     */
    async adicionarEmail(dados) {
        try {
            const email = new FilaEmail({
                destinatario: dados.destinatario,
                assunto: dados.assunto,
                conteudo: dados.conteudo,
                templateId: dados.templateId,
                metadata: dados.metadata || {},
                prioridade: dados.prioridade || 0
            });

            await email.save();
            console.log(`E-mail adicionado à fila: ${dados.destinatario}`);
            
            // Inicia o processamento se não estiver rodando
            this.iniciarProcessamento();
            
            return email;
        } catch (error) {
            console.error('Erro ao adicionar e-mail à fila:', error);
            throw error;
        }
    }

    /**
     * Processa um e-mail específico
     */
    async processarEmail(email) {
        try {
            console.log(`Processando e-mail para: ${email.destinatario}`);
            
            // Verificar se o Resend está configurado
            if (!resend) {
                throw new Error('Resend não configurado. Verifique RESEND_API_KEY.');
            }
            
            const { data, error } = await resend.emails.send({
                from: 'Alpha Race Team <suporte@alpharaceteam.com.br>',
                to: [email.destinatario],
                subject: email.assunto,
                html: email.conteudo
            });

            if (error) {
                throw new Error(`Resend API error: ${error.message}`);
            }

            await email.marcarEnviado();
            console.log(`E-mail enviado com sucesso: ${email.destinatario}`);
            
            return { success: true, data };
        } catch (error) {
            console.error(`Erro ao processar e-mail para ${email.destinatario}:`, error);
            
            // Calcula próxima tentativa com backoff exponencial
            const delay = Math.min(5 * Math.pow(2, email.tentativas), 60) * 60 * 1000; // 5min, 10min, 20min, 60min
            const proximaTentativa = new Date(Date.now() + delay);
            
            await email.marcarErro(error.message, proximaTentativa);
            
            return { success: false, error: error.message };
        }
    }

    /**
     * Processa todos os e-mails pendentes
     */
    async processarFila() {
        if (this.isProcessing) {
            console.log('Processamento já em andamento, pulando...');
            return;
        }

        this.isProcessing = true;

        try {
            const emailsPendentes = await FilaEmail.buscarPendentes(10);
            
            if (emailsPendentes.length === 0) {
                console.log('Nenhum e-mail pendente para processar');
                return;
            }

            console.log(`Processando ${emailsPendentes.length} e-mails pendentes`);

            // Processa e-mails em paralelo (máximo 3 simultâneos)
            const promises = emailsPendentes.map(email => this.processarEmail(email));
            const resultados = await Promise.allSettled(promises);

            const sucessos = resultados.filter(r => r.status === 'fulfilled' && r.value.success).length;
            const erros = resultados.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

            console.log(`Processamento concluído: ${sucessos} sucessos, ${erros} erros`);
        } catch (error) {
            console.error('Erro durante processamento da fila:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Inicia o processamento automático da fila
     */
    iniciarProcessamento(intervalo = 30000) { // 30 segundos
        if (this.processingInterval) {
            console.log('Processamento já está ativo');
            return;
        }

        console.log('Iniciando processamento automático da fila de e-mails');
        
        this.processingInterval = setInterval(() => {
            this.processarFila();
        }, intervalo);
    }

    /**
     * Para o processamento automático
     */
    pararProcessamento() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
            console.log('Processamento automático parado');
        }
    }

    /**
     * Obtém estatísticas da fila
     */
    async obterEstatisticas() {
        try {
            const [pendentes, enviados, erros, total] = await Promise.all([
                FilaEmail.countDocuments({ status: 'Pendente' }),
                FilaEmail.countDocuments({ status: 'Enviado' }),
                FilaEmail.countDocuments({ status: 'Erro' }),
                FilaEmail.countDocuments()
            ]);

            return {
                pendentes,
                enviados,
                erros,
                total,
                taxaSucesso: total > 0 ? ((enviados / total) * 100).toFixed(2) + '%' : '0%'
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            throw error;
        }
    }

    /**
     * Limpa e-mails antigos (mais de 30 dias)
     */
    async limparEmailsAntigos(dias = 30) {
        try {
            const dataLimite = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
            const resultado = await FilaEmail.deleteMany({
                dataCriacao: { $lt: dataLimite },
                status: { $in: ['Enviado', 'Erro'] }
            });

            console.log(`Limpeza concluída: ${resultado.deletedCount} e-mails removidos`);
            return resultado.deletedCount;
        } catch (error) {
            console.error('Erro ao limpar e-mails antigos:', error);
            throw error;
        }
    }
}

// Instância singleton
const emailQueueService = new EmailQueueService();

module.exports = emailQueueService; 