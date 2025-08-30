const connectDB = require('../config/database');
const emailQueueService = require('../services/EmailQueueService');
const config = require('../config/env');

class EmailWorker {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.intervalTime = 30000; // 30 segundos
    }

    async start() {
        try {
            console.log('🔄 Iniciando Email Worker...');
            
            // Conecta ao banco de dados
            await connectDB();
            console.log('✅ Conectado ao banco de dados');
            
            // Inicia o processamento automático
            this.isRunning = true;
            this.interval = setInterval(async () => {
                if (this.isRunning) {
                    await this.processQueue();
                }
            }, this.intervalTime);
            
            console.log(`✅ Email Worker iniciado - processando a cada ${this.intervalTime / 1000} segundos`);
            
            // Processa imediatamente na primeira execução
            await this.processQueue();
            
        } catch (error) {
            console.error('❌ Erro ao iniciar Email Worker:', error);
            process.exit(1);
        }
    }

    async processQueue() {
        try {
            await emailQueueService.processarFila();
        } catch (error) {
            console.error('❌ Erro durante processamento da fila:', error);
        }
    }

    async stop() {
        console.log('🛑 Parando Email Worker...');
        
        this.isRunning = false;
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        // Para o processamento automático do serviço
        emailQueueService.pararProcessamento();
        
        console.log('✅ Email Worker parado');
        process.exit(0);
    }

    async getStats() {
        try {
            const stats = await emailQueueService.obterEstatisticas();
            console.log('📊 Estatísticas da fila:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
        }
    }

    async cleanup() {
        try {
            console.log('🧹 Iniciando limpeza de e-mails antigos...');
            const removed = await emailQueueService.limparEmailsAntigos(30);
            console.log(`✅ Limpeza concluída: ${removed} e-mails removidos`);
        } catch (error) {
            console.error('❌ Erro durante limpeza:', error);
        }
    }
}

// Instância do worker
const worker = new EmailWorker();

// Tratamento de sinais para parada graciosa
process.on('SIGINT', async () => {
    console.log('\n📡 Recebido SIGINT, parando graciosamente...');
    await worker.stop();
});

process.on('SIGTERM', async () => {
    console.log('\n📡 Recebido SIGTERM, parando graciosamente...');
    await worker.stop();
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada não tratada:', reason);
    process.exit(1);
});

// Comandos via linha de comando
const command = process.argv[2];

switch (command) {
    case 'start':
        worker.start();
        break;
    case 'stats':
        worker.start().then(() => {
            setTimeout(async () => {
                await worker.getStats();
                await worker.stop();
            }, 2000);
        });
        break;
    case 'cleanup':
        worker.start().then(() => {
            setTimeout(async () => {
                await worker.cleanup();
                await worker.stop();
            }, 2000);
        });
        break;
    default:
        console.log('📋 Comandos disponíveis:');
        console.log('  start   - Inicia o worker de e-mails');
        console.log('  stats   - Mostra estatísticas da fila');
        console.log('  cleanup - Limpa e-mails antigos');
        process.exit(0);
} 