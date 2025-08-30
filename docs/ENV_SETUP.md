# Configuração das Variáveis de Ambiente

## 🔑 Variáveis Necessárias

### **Obrigatórias:**

```env
# Banco de dados MongoDB
MONGODB_URI=mongodb://localhost:27017/alpharaceteam

# Autenticação JWT
JWT_SECRET=sua_chave_secreta_jwt_aqui

# Servidor
PORT=3000
NODE_ENV=development

# Serviço de E-mail (RESEND)
RESEND_API_KEY=re_1234567890abcdef1234567890abcdef12345678

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
```

### **Opcionais:**

```env
# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Google Sheets (se usar)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_REFRESH_TOKEN=seu_google_refresh_token
GOOGLE_SHEET_ID=seu_google_sheet_id
```

## 🚀 Como Configurar

### **1. Desenvolvimento Local**

Crie um arquivo `.env` na raiz do projeto:

```bash
# Na raiz do projeto
touch .env
```

Adicione o conteúdo:

```env
# Banco de dados
MONGODB_URI=mongodb://localhost:27017/alpharaceteam

# JWT
JWT_SECRET=minha_chave_secreta_super_segura_123

# Servidor
PORT=3000
NODE_ENV=development

# Resend (OBRIGATÓRIO para e-mails)
RESEND_API_KEY=re_1234567890abcdef1234567890abcdef12345678
```

### **2. Produção (Render)**

No painel da Render, vá em **Environment Variables** e adicione:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `sua_uri_mongodb_producao` |
| `JWT_SECRET` | `chave_secreta_producao` |
| `NODE_ENV` | `production` |
| `RESEND_API_KEY` | `re_1234567890abcdef1234567890abcdef12345678` |

## 📧 Configurando o Resend

### **1. Criar conta no Resend**

1. Acesse [resend.com](https://resend.com)
2. Clique em **Sign Up**
3. Crie sua conta

### **2. Obter API Key**

1. Faça login no Resend
2. Vá em **API Keys**
3. Clique em **Create API Key**
4. Dê um nome (ex: "Alpha Race Team")
5. Copie a chave (começa com `re_`)

### **3. Configurar Domínio (Opcional)**

Para usar seu próprio domínio:

1. Vá em **Domains**
2. Adicione seu domínio
3. Configure os registros DNS
4. Use: `suporte@seudominio.com.br`

Para testes, pode usar: `onboarding@resend.dev`

## 🔍 Verificando a Configuração

### **Teste Local:**

```bash
# Verificar se as variáveis estão carregadas
node -e "require('dotenv').config(); console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurada' : '❌ Não configurada')"
```

### **Teste na API:**

```bash
# Testar envio de e-mail
curl -X POST http://localhost:3000/fila-email/processar-publico
```

## 🚨 Problemas Comuns

### **Erro: "Missing API key"**

**Solução:**
1. Verificar se o arquivo `.env` existe
2. Verificar se `RESEND_API_KEY` está definida
3. Reiniciar o servidor

### **Erro: "Invalid API key"**

**Solução:**
1. Verificar se a chave está correta
2. Verificar se a conta do Resend está ativa
3. Verificar se há créditos disponíveis

### **E-mails não são enviados**

**Solução:**
1. Verificar logs do worker
2. Verificar status da fila: `GET /fila-email/estatisticas`
3. Verificar se o domínio está configurado

## 📋 Checklist de Configuração

- [ ] Arquivo `.env` criado na raiz
- [ ] `MONGODB_URI` configurada
- [ ] `JWT_SECRET` configurada
- [ ] `RESEND_API_KEY` configurada
- [ ] Conta no Resend criada
- [ ] API Key obtida
- [ ] Servidor reiniciado
- [ ] Teste de envio realizado

## 🔒 Segurança

### **NUNCA faça:**

- ❌ Commitar o arquivo `.env` no git
- ❌ Compartilhar suas API keys
- ❌ Usar chaves de produção em desenvolvimento

### **SEMPRE faça:**

- ✅ Adicionar `.env` ao `.gitignore`
- ✅ Usar chaves diferentes para dev/prod
- ✅ Rotacionar chaves periodicamente
- ✅ Monitorar uso das APIs

## 📞 Suporte

Se tiver problemas:

1. Verificar se todas as variáveis estão configuradas
2. Verificar logs do servidor
3. Testar com a API do Resend diretamente
4. Consultar a documentação do Resend

---

**✅ Com essas configurações, o sistema de e-mails funcionará perfeitamente!** 