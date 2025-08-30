# Sistema de Fila de E-mails - Alpha Race Team API

## Visão Geral

O sistema de fila de e-mails foi implementado para melhorar a robustez, escalabilidade e monitoramento do envio de e-mails na aplicação. Em vez de enviar e-mails diretamente durante as requisições, os e-mails são adicionados a uma fila e processados de forma assíncrona.

## Benefícios

### 1. **Desacoplamento do Envio**
- As requisições não ficam travadas esperando o envio de e-mails
- Melhora significativamente o tempo de resposta da API
- Evita timeouts em casos de problemas com o provedor de e-mail

### 2. **Controle e Monitoramento**
- Rastreamento completo de todos os e-mails
- Estatísticas detalhadas (pendentes, enviados, erros)
- Logs de processamento para debugging

### 3. **Reenvio Automático**
- Tentativas automáticas em caso de falha
- Backoff exponencial (5min, 10min, 20min, 60min)
- Máximo de 3 tentativas por e-mail

### 4. **Escalabilidade**
- Processamento paralelo de múltiplos e-mails
- Worker independente que pode ser escalado separadamente
- Priorização de e-mails (0-10, sendo 10 a mais alta)

## Estrutura da Tabela FilaEmail

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `destinatario` | String | E-mail do destinatário |
| `assunto` | String | Assunto do e-mail |
| `conteudo` | String | Corpo do e-mail (HTML) |
| `status` | Enum | Pendente, Enviado, Erro, Cancelado |
| `tentativas` | Number | Quantidade de tentativas realizadas |
| `maxTentativas` | Number | Máximo de tentativas (padrão: 3) |
| `dataCriacao` | Date | Data de criação do registro |
| `dataEnvio` | Date | Data do envio bem-sucedido |
| `proximaTentativa` | Date | Próxima tentativa (se houver erro) |
| `erro` | String | Mensagem de erro (se houver) |
| `templateId` | String | Identificador do template usado |
| `metadata` | Object | Dados adicionais (nome, tipo, etc.) |
| `prioridade` | Number | Prioridade (0-10, sendo 10 a mais alta) |

## Como Usar

### 1. Enviando E-mails

```javascript
const { enviarEmailCadastro, enviarEmailRecuperacaoSenha } = require('./config/emailService');

// E-mail de cadastro
await enviarEmailCadastro({
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    senha: 'senha123'
});

// E-mail de recuperação de senha
await enviarEmailRecuperacaoSenha({
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    token: 'token-de-recuperacao'
});

// E-mail personalizado
await enviarEmailPersonalizado({
    destinatario: 'joao@exemplo.com',
    assunto: 'Assunto personalizado',
    conteudo: '<h1>Conteúdo HTML</h1>',
    prioridade: 8,
    metadata: { tipo: 'notificacao' }
});
```

### 2. Executando o Worker

```bash
# Iniciar o worker de e-mails
npm run worker:start

# Verificar estatísticas
npm run worker:stats

# Limpar e-mails antigos (mais de 30 dias)
npm run worker:cleanup
```

### 3. Monitoramento via API

#### Estatísticas da Fila
```http
GET /fila-email/estatisticas
Authorization: Bearer <token>
```

#### Listar E-mails
```http
GET /fila-email/emails?pagina=1&limite=20&status=Pendente
Authorization: Bearer <token>
```

#### Reprocessar E-mail
```http
POST /fila-email/emails/:id/reprocessar
Authorization: Bearer <token>
```

#### Forçar Processamento
```http
POST /fila-email/processar
Authorization: Bearer <token>
```

## Configuração

### Variáveis de Ambiente

```env
RESEND_API_KEY=sua_chave_api_resend
```

### Configurações do Worker

O worker processa e-mails a cada 30 segundos por padrão. Para alterar:

```javascript
// Em src/workers/emailWorker.js
this.intervalTime = 30000; // 30 segundos
```

### Configurações de Retry

```javascript
// Em src/services/EmailQueueService.js
const delay = Math.min(5 * Math.pow(2, email.tentativas), 60) * 60 * 1000;
// 5min, 10min, 20min, 60min (máximo)
```

## Monitoramento e Logs

### Logs do Worker

O worker gera logs detalhados:

```
🔄 Iniciando Email Worker...
✅ Conectado ao banco de dados
✅ Email Worker iniciado - processando a cada 30 segundos
Processando 5 e-mails pendentes
E-mail enviado com sucesso: joao@exemplo.com
Processamento concluído: 4 sucessos, 1 erros
```

### Estatísticas Disponíveis

- **Pendentes**: E-mails aguardando processamento
- **Enviados**: E-mails enviados com sucesso
- **Erros**: E-mails que falharam após todas as tentativas
- **Taxa de Sucesso**: Percentual de e-mails enviados com sucesso

## Tratamento de Erros

### Tipos de Erro

1. **Erros Temporários**: Problemas de rede, timeout do Resend
   - Tentativa automática com backoff exponencial
   
2. **Erros Permanentes**: E-mail inválido, domínio inexistente
   - Marcado como erro após 3 tentativas
   
3. **Erros de Configuração**: API key inválida
   - Log detalhado para debugging

### Ações Corretivas

1. **Reprocessamento Manual**: Via API ou interface administrativa
2. **Cancelamento**: Para e-mails que não devem mais ser enviados
3. **Limpeza Automática**: Remove e-mails antigos (mais de 30 dias)

## Segurança

### Controle de Acesso

- Todas as rotas de gerenciamento requerem autenticação
- Apenas usuários com perfil 'admin' podem acessar
- Logs de todas as ações administrativas

### Validação de Dados

- Validação de formato de e-mail
- Sanitização de conteúdo HTML
- Limite de tamanho de conteúdo
- Rate limiting nas APIs

## Performance

### Otimizações Implementadas

1. **Índices de Banco**: Otimizados para consultas frequentes
2. **Processamento Paralelo**: Até 10 e-mails simultâneos
3. **Limpeza Automática**: Remove dados antigos
4. **Cache de Conexões**: Reutiliza conexões com MongoDB

### Métricas de Performance

- **Tempo de Processamento**: ~2-5 segundos por lote de 10 e-mails
- **Throughput**: ~100-200 e-mails por minuto
- **Latência**: < 100ms para adicionar à fila

## Troubleshooting

### Problemas Comuns

1. **Worker não processa e-mails**
   - Verificar conexão com banco de dados
   - Verificar API key do Resend
   - Verificar logs do worker

2. **E-mails ficam em erro**
   - Verificar formato dos e-mails
   - Verificar limite de rate do Resend
   - Verificar domínio de origem

3. **Performance lenta**
   - Aumentar intervalo de processamento
   - Reduzir tamanho do lote
   - Verificar recursos do servidor

### Comandos de Debug

```bash
# Verificar status do worker
npm run worker:stats

# Verificar logs em tempo real
tail -f logs/email-worker.log

# Testar conexão com Resend
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@resend.dev","to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
```

## Próximos Passos

### Melhorias Futuras

1. **Webhooks**: Notificações em tempo real de status
2. **Templates Dinâmicos**: Sistema de templates mais robusto
3. **Métricas Avançadas**: Dashboard com gráficos
4. **Multi-tenant**: Suporte a múltiplos provedores de e-mail
5. **SMS**: Integração com envio de SMS

### Integração com Frontend

```javascript
// Exemplo de integração com React/Vue
const checkEmailStatus = async (emailId) => {
    const response = await fetch(`/fila-email/emails/${emailId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
};
```

## Suporte

Para dúvidas ou problemas:

1. Verificar logs do worker
2. Consultar estatísticas da fila
3. Verificar documentação do Resend
4. Abrir issue no repositório

---

**Desenvolvido por Dryko Tech para Alpha Race Team** 