const dotenv = require('dotenv');
dotenv.config();

// Configuração do fuso horário para Brasília (UTC-3)
process.env.TZ = 'America/Sao_Paulo';

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const connectDB = require('./config/database');
const config = require('./config/env');
const authMiddleware = require('./middleware/auth');
const loggerMiddleware = require('./middleware/logger');
const emailQueueService = require('./services/EmailQueueService');
const { 
    userRateLimiter, 
    publicRateLimiter, 
    authRateLimiter 
} = require('./middleware/rateLimiter');

const usuarioRoutes = require('./routes/usuario');
const authRoutes = require('./routes/auth');
const enderecoRoutes = require('./routes/endereco');
const historicoCorridaRoutes = require('./routes/historicoCorrida');
const logRoutes = require('./routes/log');
const filaEmailRoutes = require('./routes/filaEmail');
const treinoRoutes = require('./routes/treino');
const relatorioRoutes = require('./routes/relatorio');
const faltaRoutes = require('./routes/falta');
const competicaoRoutes = require('./routes/competicao');
const treinoOficialRoutes = require('./routes/treinoOficial');
const corridaOficialRoutes = require('./routes/corridaOficial');

const app = express();

// Configuração de logs de requisições
app.use(morgan('combined'));
// Middleware de segurança HTTP
app.use(helmet());
// Middleware de compressão de respostas
app.use(compression());

// Configuração de CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requisições sem origin (como aplicações mobile ou Postman)
        if (!origin) return callback(null, true);
        
        // Em desenvolvimento, permitir todos os origins
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // Usar configuração do arquivo env.js
        const allowedOrigins = config.server.allowedOrigins;
        
        // Se ALLOWED_ORIGINS for '*', permitir todos
        if (allowedOrigins === '*' || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        
        // Verificar se o origin está na lista permitida
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`CORS bloqueado para origin: ${origin}`);
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    credentials: true, // Permite cookies e headers de autenticação
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

app.use(express.json());

// Middleware de logger (deve vir antes das rotas)
app.use(loggerMiddleware);

// Rotas públicas (não precisam de autenticação)
app.use('/auth', authRateLimiter, authRoutes);

// Rotas protegidas (precisam de autenticação)
app.use('/usuarios', authMiddleware, userRateLimiter, usuarioRoutes);
app.use('/enderecos', authMiddleware, userRateLimiter, enderecoRoutes);
app.use('/historicos-corrida', authMiddleware, userRateLimiter, historicoCorridaRoutes);
app.use('/treinos', authMiddleware, userRateLimiter, treinoRoutes);
app.use('/faltas', authMiddleware, userRateLimiter, faltaRoutes);
app.use('/relatorios', authMiddleware, userRateLimiter, relatorioRoutes);
app.use('/logs', authMiddleware, userRateLimiter, logRoutes);
app.use('/fila-email', authMiddleware, userRateLimiter, filaEmailRoutes);
app.use('/competicoes', authMiddleware, userRateLimiter, competicaoRoutes);
app.use('/treinos-oficiais', authMiddleware, userRateLimiter, treinoOficialRoutes);
app.use('/corridas-oficiais', authMiddleware, userRateLimiter, corridaOficialRoutes);

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Alpha Race Team API',
        version: '1.0.0',
        description: 'Documentação da API Alpha Race Team',
    },
    tags: [
        { name: 'Auth', description: 'Autenticação e login' },
        { name: 'Competição', description: 'Gerenciamento de competições' },
        { name: 'CorridaOficial', description: 'Gerenciamento de corridas oficiais' },
        { name: 'Endereco', description: 'Gerenciamento de endereços' },
        { name: 'FilaEmail', description: 'Gerenciamento da fila de e-mails' },
        { name: 'Falta', description: 'Gerenciamento de faltas' },
        { name: 'HistoricoCorrida', description: 'Histórico de corridas' },
        { name: 'Logs', description: 'Logs do sistema' },
        { name: 'Relatórios', description: 'Relatórios de treinos e corridas' },
        { name: 'Treino', description: 'Gerenciamento de treinos' },
        { name: 'TreinoOficial', description: 'Gerenciamento de treinos oficiais' },
        { name: 'Usuário', description: 'Gerenciamento de usuários' }
    ],
    servers: [
        {
            url: `https://alpharaceteam-api.onrender.com/`,
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Token JWT obtido através do endpoint /auth/login'
            }
        }
    },
    security: [] // Não aplica autenticação globalmente, cada rota define sua própria segurança
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Redireciona a rota raiz '/' para a documentação Swagger
app.get('/', (req, res) => {
    res.redirect('/swagger');
});

// Rota de health check para manter a aplicação ativa
app.get('/health', (req, res) => {
    return res.status(200).json(new ApiResponse(true, 'Servidor funcionando normalmente', { 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    }));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).json(new ApiResponse(false, 'Erro interno do servidor', null, { error: err.message }));
});

// Função para iniciar o worker de e-mails
function iniciarEmailWorker() {
    console.log('🔄 Iniciando Email Worker integrado...');
    
    // Processa e-mails a cada 30 segundos
    const interval = setInterval(async () => {
        try {
            await emailQueueService.processarFila();
        } catch (error) {
            console.error('❌ Erro no worker de e-mails:', error);
        }
    }, 30000); // 30 segundos
    
    // Limpa o intervalo quando a aplicação for encerrada
    process.on('SIGINT', () => {
        console.log('🛑 Parando Email Worker...');
        clearInterval(interval);
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('🛑 Parando Email Worker...');
        clearInterval(interval);
        process.exit(0);
    });
    
    console.log('✅ Email Worker integrado iniciado');
}

connectDB().then(() => {
    app.listen(config.server.port, () => {
        console.log(`Servidor rodando na porta ${config.server.port}`);
        
        // Inicia o worker de e-mails após a aplicação estar rodando
        iniciarEmailWorker();
    });
}).catch(err => {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
});