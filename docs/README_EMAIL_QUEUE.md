# Sistema de Fila de E-mails - Guia Rápido

## 🚀 Implementação Completa

O sistema de fila de e-mails foi implementado com sucesso! Aqui está um guia rápido de como usar:

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- `src/models/FilaEmail.js` - Modelo da tabela de fila
- `src/services/EmailQueueService.js` - Serviço de processamento
- `src/controllers/FilaEmailController.js` - Controller para gerenciamento
- `src/routes/filaEmail.js` - Rotas da API
- `src/workers/emailWorker.js` - Worker independente
- `EMAIL_QUEUE.md` - Documentação completa
- `README_EMAIL_QUEUE.md` - Este guia

### Arquivos Modificados:
- `src/config/emailService.js` - Atualizado para usar fila
- `src/controllers/UsuarioController.js` - Integração com e-mail de cadastro
- `src/controllers/AuthController.js` - Recuperação de senha
- `src/models/Usuario.js` - Campos de recuperação de senha
- `src/routes/auth.js` - Novas rotas de autenticação
- `src/app.js` - Rotas da fila de e-mails
- `package.json` - Scripts do worker

## 🎯 Como Usar

### 1. Iniciar o Worker

```bash
# Iniciar o worker de e-mails
npm run worker:start

# Verificar estatísticas
npm run worker:stats

# Limpar e-mails antigos
npm run worker:cleanup
```

### 2. Enviar E-mails

```javascript
const { enviarEmailCadastro, enviarEmailRecuperacaoSenha } = require('./config/emailService');

// E-mail de cadastro (automático ao criar usuário)
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
```

### 3. Monitorar via API

```bash
# Estatísticas da fila
curl -H "Authorization: Bearer <token>" \
  https://api.alpharaceteam.com/fila-email/estatisticas

# Listar e-mails pendentes
curl -H "Authorization: Bearer <token>" \
  https://api.alpharaceteam.com/fila-email/emails?status=Pendente

# Forçar processamento
curl -X POST -H "Authorization: Bearer <token>" \
  https://api.alpharaceteam.com/fila-email/processar
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
RESEND_API_KEY=sua_chave_api_resend
JWT_SECRET=seu_jwt_secret
```

### Scripts Disponíveis

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "worker:start": "node src/workers/emailWorker.js start",
    "worker:stats": "node src/workers/emailWorker.js stats",
    "worker:cleanup": "node src/workers/emailWorker.js cleanup"
  }
}
```

## 📊 Monitoramento

### Logs do Worker

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
- **Erros**: E-mails que falharam após 3 tentativas
- **Taxa de Sucesso**: Percentual de sucesso

## 🔄 Funcionalidades Implementadas

### ✅ E-mail de Cadastro
- Enviado automaticamente ao criar usuário
- Contém senha temporária
- Prioridade média (5)

### ✅ Recuperação de Senha
- Token seguro (32 bytes, hex)
- Expira em 1 hora
- Alta prioridade (8)

### ✅ Reenvio Automático
- Backoff exponencial: 5min, 10min, 20min, 60min
- Máximo 3 tentativas
- Logs detalhados de erros

### ✅ Monitoramento Completo
- API para estatísticas
- Listagem com filtros
- Reprocessamento manual
- Limpeza automática

## 🛡️ Segurança

- Autenticação JWT obrigatória
- Apenas admins podem gerenciar fila
- Validação de e-mails
- Rate limiting
- Logs de auditoria

## 🚀 Deploy

### 1. Produção
```bash
# Iniciar API
npm start

# Iniciar worker (em processo separado)
npm run worker:start
```

### 2. Desenvolvimento
```bash
# API com hot reload
npm run dev

# Worker em terminal separado
npm run worker:start
```

## 📈 Benefícios Alcançados

1. **Performance**: Requisições não travam mais
2. **Confiabilidade**: Reenvio automático em falhas
3. **Monitoramento**: Controle total sobre e-mails
4. **Escalabilidade**: Worker independente
5. **Manutenibilidade**: Código organizado e documentado

## 🔍 Troubleshooting

### Worker não processa
```bash
# Verificar logs
npm run worker:stats

# Verificar API key
echo $RESEND_API_KEY
```

### E-mails em erro
```bash
# Verificar detalhes
curl -H "Authorization: Bearer <token>" \
  https://api.alpharaceteam.com/fila-email/emails?status=Erro
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do worker
2. Consultar `EMAIL_QUEUE.md` para documentação completa
3. Verificar estatísticas da fila
4. Abrir issue no repositório

---

**🎉 Sistema implementado com sucesso! Agora você tem um sistema robusto e escalável para envio de e-mails.** 