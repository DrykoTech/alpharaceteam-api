# Sistema de Rate Limiting - Alpha Race Team API

## Visão Geral

O sistema de rate limiting foi redesenhado para ser mais inteligente e adequado para uma aplicação em produção com múltiplos usuários. Em vez de limitar apenas por IP, agora consideramos o contexto do usuário e o tipo de operação.

## Problema Anterior

O rate limiting anterior estava configurado apenas por IP:
- **Limite**: 100 requisições por IP em 15 minutos
- **Problema**: Múltiplos usuários compartilhando o mesmo IP eram limitados juntos
- **Impacto**: Usuários legítimos eram bloqueados por atividades de outros usuários

## Nova Solução

### 1. **Rate Limiting por Usuário Autenticado**
```javascript
// 1000 requisições por usuário autenticado em 15 minutos
userRateLimiter: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // 1000 requisições por usuário
    keyGenerator: (req) => req.usuario ? req.usuario.id : req.ip
}
```

**Aplicação**: Todas as rotas protegidas (requerem autenticação)
- `/usuarios/*`
- `/enderecos/*`
- `/historicos-corrida/*`
- `/treinos/*`
- `/relatorios/*`
- `/logs/*`
- `/fila-email/*`

### 2. **Rate Limiting para Autenticação**
```javascript
// 10 tentativas de login por IP em 15 minutos
authRateLimiter: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 tentativas por IP
    keyGenerator: (req) => req.ip
}
```

**Aplicação**: Rotas de autenticação
- `/auth/login`
- `/auth/recuperar-senha`
- `/auth/redefinir-senha`

### 3. **Rate Limiting para Operações Pesadas**
```javascript
// 20 operações pesadas por usuário em 5 minutos
heavyOperationRateLimiter: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 20, // 20 operações por usuário
    keyGenerator: (req) => req.usuario ? req.usuario.id : req.ip
}
```

**Aplicação**: Relatórios complexos
- `/relatorios/usuario/:id/performance`
- `/relatorios/usuario/:id/treinos`
- `/relatorios/usuario/:id/corridas`

### 4. **Rate Limiting para E-mails**
```javascript
// 5 solicitações de e-mail por usuário por hora
emailRateLimiter: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 solicitações por usuário
    keyGenerator: (req) => req.usuario ? req.usuario.id : req.ip
}
```

**Aplicação**: Solicitações de e-mail
- `/auth/recuperar-senha`

## Benefícios da Nova Implementação

### 1. **Justiça entre Usuários**
- Cada usuário autenticado tem seu próprio limite
- Usuários não são penalizados por atividades de outros
- Limites adequados para uso normal da aplicação

### 2. **Proteção contra Abuso**
- Limites específicos para operações sensíveis (login, e-mails)
- Proteção contra ataques de força bruta
- Prevenção de spam de e-mails

### 3. **Performance Otimizada**
- Operações pesadas (relatórios) têm limites específicos
- Evita sobrecarga do servidor
- Melhora a experiência para todos os usuários

### 4. **Flexibilidade**
- Diferentes limites para diferentes tipos de operação
- Mensagens de erro personalizadas
- Headers de retry automáticos

## Mensagens de Erro

### Usuário Autenticado
```json
{
    "success": false,
    "message": "Limite de requisições excedido para este usuário. Tente novamente em alguns minutos."
}
```

### Autenticação
```json
{
    "success": false,
    "message": "Muitas tentativas de login. Tente novamente em alguns minutos."
}
```

### Operações Pesadas
```json
{
    "success": false,
    "message": "Limite de operações pesadas excedido. Tente novamente em alguns minutos."
}
```

### E-mails
```json
{
    "success": false,
    "message": "Limite de solicitações de e-mail excedido. Tente novamente em uma hora."
}
```

## Headers de Resposta

O sistema inclui headers padrão para rate limiting:

- `X-RateLimit-Limit`: Limite máximo de requisições
- `X-RateLimit-Remaining`: Requisições restantes
- `X-RateLimit-Reset`: Timestamp de reset do limite
- `Retry-After`: Tempo em segundos para tentar novamente

## Configuração

### Variáveis de Ambiente
```env
# Não são necessárias variáveis específicas para rate limiting
# Os limites são configurados diretamente no código
```

### Personalização
Para alterar os limites, edite o arquivo `src/middleware/rateLimiter.js`:

```javascript
// Exemplo: Aumentar limite de usuários autenticados
const userRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 2000, // Aumentar para 2000 requisições
    // ... outras configurações
});
```

## Monitoramento

### Logs
O sistema registra automaticamente:
- Tentativas de rate limiting
- IPs e usuários que excedem limites
- Padrões de uso anômalos

### Métricas
- Número de requisições bloqueadas por tipo
- Usuários mais ativos
- Horários de pico de uso

## Troubleshooting

### Usuário Reclamando de Limites
1. Verificar se o usuário está autenticado
2. Confirmar se não há múltiplas sessões ativas
3. Verificar se não há scripts ou bots fazendo requisições
4. Considerar aumentar limites se necessário

### Performance Lenta
1. Verificar se operações pesadas estão sendo limitadas
2. Monitorar uso de recursos do servidor
3. Considerar otimizar consultas de banco de dados

### Ataques de Força Bruta
1. Verificar logs de tentativas de login
2. Monitorar IPs com muitas tentativas
3. Considerar implementar blacklist de IPs

## Próximos Passos

### Melhorias Futuras
1. **Rate Limiting Dinâmico**: Ajustar limites baseado no comportamento do usuário
2. **Whitelist de IPs**: Permitir IPs confiáveis sem limitações
3. **Dashboard de Monitoramento**: Interface para visualizar métricas
4. **Notificações**: Alertas quando limites são excedidos
5. **Machine Learning**: Detectar padrões anômalos automaticamente

---

**Implementado por Dryko Tech para Alpha Race Team** 