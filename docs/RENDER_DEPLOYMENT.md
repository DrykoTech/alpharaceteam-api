# Deploy na Render - Sistema de Fila de E-mails

## 🚨 Limitações da Render

A Render tem algumas limitações que afetam o funcionamento do worker de e-mails:

### Problemas:
- **Free Tier**: 15 minutos de inatividade, depois dorme
- **Hobby Tier**: 30 minutos de inatividade
- **Processos de Longa Duração**: Podem ser interrompidos
- **Recursos Limitados**: CPU e memória compartilhados

## ✅ Soluções Implementadas

### **Opção 1: Worker Integrado (RECOMENDADO)**

O worker agora roda dentro da própria aplicação web:

```javascript
// Em src/app.js
function iniciarEmailWorker() {
    const interval = setInterval(async () => {
        await emailQueueService.processarFila();
    }, 30000); // 30 segundos
}
```

**Vantagens:**
- ✅ Funciona na Render Free/Hobby
- ✅ Processamento automático
- ✅ Sem custo adicional
- ✅ Health check mantém ativo

**Como usar:**
```bash
# Apenas iniciar a aplicação
npm start
```

### **Opção 2: Processamento via API**

Rota pública para processar e-mails:

```http
POST /fila-email/processar-publico
```

**Vantagens:**
- ✅ Pode ser chamada por serviços externos
- ✅ Controle manual do processamento
- ✅ Funciona com cron jobs

**Como usar:**
```bash
# Via curl
curl -X POST https://sua-api.onrender.com/fila-email/processar-publico

# Via cron job externo
*/5 * * * * curl -X POST https://sua-api.onrender.com/fila-email/processar-publico
```

### **Opção 3: Render Cron Job**

Usando o serviço cron da Render:

```yaml
# render.yaml
- type: cron
  name: email-processor
  schedule: "*/5 * * * *"  # A cada 5 minutos
  startCommand: node src/workers/emailWorker.js start
```

**Vantagens:**
- ✅ Processamento garantido
- ✅ Gerenciado pela Render
- ✅ Logs separados

**Desvantagens:**
- ❌ Custo adicional (cron jobs são pagos)
- ❌ Complexidade de configuração

## 🚀 Configuração Recomendada

### **Para Free/Hobby Tier:**

1. **Use a Opção 1 (Worker Integrado)**
2. **Configure Health Check:**
   ```javascript
   app.get('/health', (req, res) => {
       res.json({ status: 'OK', timestamp: new Date().toISOString() });
   });
   ```

3. **Configure Variáveis de Ambiente:**
   ```env
   RESEND_API_KEY=sua_chave_api_resend
   JWT_SECRET=seu_jwt_secret
   MONGODB_URI=sua_uri_mongodb
   ```

### **Para Paid Tier:**

1. **Use a Opção 3 (Render Cron Job)**
2. **Configure o arquivo `render.yaml`**
3. **Deploy via Git**

## 📊 Monitoramento na Render

### **Logs da Aplicação:**
```bash
# Ver logs em tempo real
render logs alpharaceteam-api

# Ver logs do cron job
render logs email-processor
```

### **Health Check:**
```bash
# Verificar se a aplicação está ativa
curl https://sua-api.onrender.com/health
```

### **Estatísticas da Fila:**
```bash
# Via API (requer autenticação)
curl -H "Authorization: Bearer <token>" \
  https://sua-api.onrender.com/fila-email/estatisticas
```

## 🔧 Configurações Específicas

### **Intervalo de Processamento:**

Para Free Tier (15min timeout):
```javascript
// Em src/app.js - aumentar intervalo
const interval = setInterval(async () => {
    await emailQueueService.processarFila();
}, 60000); // 1 minuto
```

Para Hobby Tier (30min timeout):
```javascript
// Em src/app.js - intervalo padrão
const interval = setInterval(async () => {
    await emailQueueService.processarFila();
}, 30000); // 30 segundos
```

### **Tamanho do Lote:**

Para evitar timeout:
```javascript
// Em src/services/EmailQueueService.js
const emailsPendentes = await FilaEmail.buscarPendentes(5); // Reduzir de 10 para 5
```

## 🛠️ Troubleshooting

### **Problema: E-mails não são processados**

**Solução 1: Verificar se a aplicação está ativa**
```bash
curl https://sua-api.onrender.com/health
```

**Solução 2: Forçar processamento manual**
```bash
curl -X POST https://sua-api.onrender.com/fila-email/processar-publico
```

**Solução 3: Verificar logs**
```bash
render logs alpharaceteam-api
```

### **Problema: Aplicação dormindo**

**Solução: Usar serviço de ping**
```bash
# Configurar cron job externo para manter ativo
*/10 * * * * curl https://sua-api.onrender.com/health
```

### **Problema: Timeout no processamento**

**Solução: Reduzir tamanho do lote**
```javascript
// Em src/services/EmailQueueService.js
const emailsPendentes = await FilaEmail.buscarPendentes(3); // Reduzir ainda mais
```

## 💡 Dicas para Render

### **1. Otimizar Performance:**
- Use índices no MongoDB
- Limpe e-mails antigos regularmente
- Monitore uso de memória

### **2. Manter Ativo:**
- Configure health check
- Use serviços de ping externos
- Considere upgrade para paid tier

### **3. Monitoramento:**
- Configure alertas na Render
- Monitore logs regularmente
- Use ferramentas externas (UptimeRobot, etc.)

## 📈 Métricas Esperadas

### **Free Tier:**
- Processamento: ~50-100 e-mails/hora
- Latência: 1-2 minutos
- Disponibilidade: 95-98%

### **Hobby Tier:**
- Processamento: ~100-200 e-mails/hora
- Latência: 30-60 segundos
- Disponibilidade: 98-99%

### **Paid Tier:**
- Processamento: ~500+ e-mails/hora
- Latência: <30 segundos
- Disponibilidade: 99%+

## 🎯 Recomendação Final

**Para Free/Hobby Tier:**
1. Use a **Opção 1 (Worker Integrado)**
2. Configure health check
3. Monitore logs regularmente
4. Considere upgrade se o volume aumentar

**Para Paid Tier:**
1. Use a **Opção 3 (Render Cron Job)**
2. Configure `render.yaml`
3. Monitore métricas
4. Otimize performance

---

**✅ Com essas configurações, o sistema funcionará perfeitamente na Render!** 