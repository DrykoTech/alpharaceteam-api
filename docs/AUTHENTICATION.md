# Autenticação da API Alpha Race Team

## Visão Geral

A API Alpha Race Team utiliza autenticação baseada em JWT (JSON Web Tokens) para proteger as rotas. Todas as rotas, exceto `/auth/login` e `POST /usuarios` (registro), requerem um token de autenticação válido.

## Como Funciona

### 1. Registro de Usuário
Para criar uma nova conta, use a rota pública:
```
POST /usuarios
```

### 2. Login
Para obter um token de autenticação:
```
POST /auth/login
Content-Type: application/json

{
  "email": "seu@email.com",
  "senha": "suasenha"
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "665f1b2c2c8b2c001f7e4a1a",
      "nome": "Nome do Usuário",
      "email": "seu@email.com",
      // ... outros campos
    }
  }
}
```

### 3. Usando o Token
Para acessar rotas protegidas, inclua o token no header `Authorization`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rotas Protegidas

Todas as seguintes rotas requerem autenticação:

### Usuários
- `GET /usuarios` - Listar todos os usuários
- `GET /usuarios/:id` - Buscar usuário por ID
- `PUT /usuarios/:id` - Atualizar usuário
- `DELETE /usuarios/:id` - Deletar usuário

### Endereços
- `POST /enderecos` - Criar endereço
- `GET /enderecos` - Listar todos os endereços
- `GET /enderecos/usuario/:usuarioId` - Buscar endereços por usuário
- `GET /enderecos/:id` - Buscar endereço por ID
- `PUT /enderecos/:id` - Atualizar endereço
- `DELETE /enderecos/:id` - Deletar endereço

### Histórico de Corrida
- `POST /historicos-corrida` - Criar histórico
- `GET /historicos-corrida` - Listar todos os históricos
- `GET /historicos-corrida/:id` - Buscar histórico por ID
- `PUT /historicos-corrida/:id` - Atualizar histórico
- `DELETE /historicos-corrida/:id` - Deletar histórico

## Rotas Públicas

- `POST /auth/login` - Login
- `POST /usuarios` - Registro de usuário

## Códigos de Erro

### 401 - Não Autorizado
- Token não fornecido
- Token inválido
- Token expirado
- Usuário não encontrado

**Exemplo de resposta de erro:**
```json
{
  "success": false,
  "message": "Token de autenticação não fornecido"
}
```

## Exemplo de Uso com cURL

```bash
# 1. Fazer login
curl -X POST https://alpharaceteam-api.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "senha": "suasenha"}'

# 2. Usar o token retornado
curl -X GET https://alpharaceteam-api.onrender.com/usuarios \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Exemplo de Uso com JavaScript/Fetch

```javascript
// 1. Fazer login
const loginResponse = await fetch('https://alpharaceteam-api.onrender.com/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'seu@email.com',
    senha: 'suasenha'
  })
});

const loginData = await loginResponse.json();
const token = loginData.data.token;

// 2. Usar o token para acessar rotas protegidas
const usuariosResponse = await fetch('https://alpharaceteam-api.onrender.com/usuarios', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const usuarios = await usuariosResponse.json();
```

## Segurança

- Os tokens JWT expiram em 7 dias
- Use HTTPS em produção
- Nunca compartilhe tokens
- Armazene tokens de forma segura no cliente
- Implemente refresh tokens se necessário para maior segurança

## Configuração de CORS

A API está configurada com CORS para permitir requisições de diferentes origens:

### Variáveis de Ambiente
Configure a variável `ALLOWED_ORIGINS` no seu arquivo `.env`:

```bash
# Permitir todos os domínios (desenvolvimento)
ALLOWED_ORIGINS=*

# Ou especificar domínios específicos
ALLOWED_ORIGINS=https://alpharaceteam.com,https://www.alpharaceteam.com,http://localhost:3000
```

### Comportamento
- **Desenvolvimento** (`NODE_ENV=development`): Permite todos os origins
- **Produção**: Usa a lista de `ALLOWED_ORIGINS` ou permite todos se configurado como `*`
- **Headers permitidos**: `Content-Type`, `Authorization`, `X-Requested-With`
- **Métodos permitidos**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Credentials**: Habilitado para suporte a cookies e autenticação 