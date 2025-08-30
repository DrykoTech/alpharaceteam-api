const LogController = require('../controllers/LogController');

// Mapeamento de rotas para entidades
const rotaParaEntidade = {
    '/usuarios': 'Usuario',
    '/enderecos': 'Endereco',
    '/historico-corridas': 'HistoricoCorrida',
    '/treinos': 'Treino',
    '/fila-email': 'FilaEmail'
};

// Mapeamento de métodos HTTP para operações (apenas modificações)
const metodoParaOperacao = {
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE'
};

const loggerMiddleware = async (req, res, next) => {
    // Capturar o tempo de início
    const startTime = Date.now();
    
    // Capturar informações da requisição
    const requestInfo = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        metodo: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    };

    // Função para criar log
    const criarLog = async (sucesso, erro = null, dadosAnteriores = null, dadosNovos = null, entidadeId = null) => {
        try {
            // Identificar entidade baseada na rota
            let entidade = rotaParaEntidade[req.baseUrl] || rotaParaEntidade[req.path.split('/')[1]];
            
            // Se não encontrou entidade, tentar extrair da URL completa
            if (!entidade) {
                const pathParts = req.path.split('/');
                for (let i = 1; i < pathParts.length; i++) {
                    const possibleRoute = '/' + pathParts[i];
                    if (rotaParaEntidade[possibleRoute]) {
                        entidade = rotaParaEntidade[possibleRoute];
                        break;
                    }
                }
            }
            
            if (!entidade) {
                return; // Não logar rotas que não são de entidades
            }

            // Identificar operação baseada no método HTTP
            let operacao = metodoParaOperacao[req.method];
            
            // Detectar operações especiais baseadas no endpoint
            if (req.path.includes('/upload-')) {
                operacao = 'UPDATE'; // Upload é considerado uma atualização
            } else if (req.path.includes('/toggle-ativo')) {
                operacao = 'UPDATE'; // Toggle é uma atualização
            } else if (req.path.includes('/alterar-senha')) {
                operacao = 'UPDATE'; // Alterar senha é uma atualização
            }
            
            if (!operacao) {
                return; // Não logar métodos não mapeados
            }

            // Só logar operações de modificação (excluir GET/READ)
            if (operacao === 'READ') {
                return; // Não logar consultas GET
            }

            // Obter ID da entidade
            let idEntidade = entidadeId;
            if (!idEntidade) {
                if (req.params.id) {
                    idEntidade = req.params.id;
                } else if (req.body._id) {
                    idEntidade = req.body._id;
                }
            }

            // Obter ID do usuário (se autenticado)
            const usuarioId = req.usuario?.id;

            // Criar dados do log
            const logData = {
                operacao,
                entidade,
                entidadeId: idEntidade,
                usuarioId: usuarioId || 'sistema', // Fallback para sistema se não houver usuário
                dadosAnteriores,
                dadosNovos,
                ip: requestInfo.ip,
                userAgent: requestInfo.userAgent,
                endpoint: requestInfo.endpoint,
                metodo: requestInfo.metodo,
                sucesso,
                erro: erro ? erro.message || erro : null
            };

            // Criar log de forma assíncrona (não bloquear a resposta)
            setImmediate(() => {
                LogController.criarLog(logData);
            });

        } catch (error) {
            console.error('Erro ao criar log:', error);
            // Não falhar a operação principal por erro no log
        }
    };

    // Interceptar a resposta para capturar dados
    const originalSend = res.send;
    res.send = function(data) {
        const endTime = Date.now();
        const duracao = endTime - startTime;
        
        // Determinar se a operação foi bem-sucedida
        const sucesso = res.statusCode >= 200 && res.statusCode < 400;
        
        // Capturar dados da resposta
        let dadosNovos = null;
        let dadosAnteriores = null;
        
        try {
            if (data && typeof data === 'string') {
                const parsedData = JSON.parse(data);
                if (parsedData.data) {
                    dadosNovos = parsedData.data;
                }
            }
        } catch (e) {
            // Ignorar erros de parsing
        }

        // Para operações de update, capturar dados anteriores se disponíveis
        if (req.method === 'PUT' || req.method === 'PATCH') {
            // Em uma implementação mais robusta, você poderia buscar os dados anteriores
            // antes de fazer o update, mas isso exigiria modificações nas controllers
        }

        // Criar log
        criarLog(sucesso, null, dadosAnteriores, dadosNovos);

        // Chamar o método original
        return originalSend.call(this, data);
    };

    // Interceptar erros
    const originalJson = res.json;
    res.json = function(data) {
        const endTime = Date.now();
        const duracao = endTime - startTime;
        
        // Determinar se a operação foi bem-sucedida
        const sucesso = res.statusCode >= 200 && res.statusCode < 400;
        
        // Capturar dados da resposta
        let dadosNovos = null;
        if (data && data.data) {
            dadosNovos = data.data;
        }

        // Criar log
        criarLog(sucesso, null, null, dadosNovos);

        // Chamar o método original
        return originalJson.call(this, data);
    };

    // Capturar erros não tratados
    const originalStatus = res.status;
    res.status = function(code) {
        if (code >= 400) {
            const endTime = Date.now();
            const duracao = endTime - startTime;
            
            // Criar log de erro
            criarLog(false, `HTTP ${code}`, null, null);
        }
        
        return originalStatus.call(this, code);
    };

    next();
};

module.exports = loggerMiddleware; 