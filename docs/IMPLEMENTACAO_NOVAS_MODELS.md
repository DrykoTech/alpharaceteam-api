# Implementação das Novas Models - Competição, TreinoOficial e CorridaOficial

## Visão Geral

Esta implementação introduz três novas models para melhorar a estrutura de dados da API Alpha Race Team, organizando melhor as competições, treinos oficiais e corridas oficiais.

## Models Implementadas

### 1. Competicao

**Arquivo:** `src/models/Competicao.js`

**Propósito:** Centralizar informações sobre competições/ligas que a equipe participa.

**Campos:**
- `nome` (String, obrigatório): Nome da competição
- `dataInicio` (Date, obrigatório): Data de início da competição
- `grids` (Array[String], obrigatório): Grids disponíveis na competição
- `campeonatos` (Array[String], obrigatório): Campeonatos da competição
- `usuarioRegistroId` (ObjectId, obrigatório): Usuário que criou a competição
- `dataCadastro` (Date): Data de criação
- `dataAlteracao` (Date): Data da última alteração

**Índices:**
- `nome`: Para busca por nome
- `dataInicio`: Para ordenação por data
- `usuarioRegistroId`: Para consultas por usuário

### 2. TreinoOficial

**Arquivo:** `src/models/TreinoOficial.js`

**Propósito:** Gerenciar treinos oficiais da equipe.

**Campos:**
- `usuarioRegistroId` (ObjectId, obrigatório): Usuário que registrou o treino
- `dataCadastro` (Date): Data de criação
- `dataAlteracao` (Date): Data da última alteração
- `dataTreino` (Date, obrigatório): Data e hora do treino
- `usuarios` (Array[ObjectId], obrigatório): Participantes do treino
- `campeonato` (String, opcional): Nome do campeonato relacionado

**Índices:**
- `dataTreino`: Para ordenação por data
- `usuarios`: Para consultas por participante
- `usuarioRegistroId`: Para consultas por usuário

### 3. CorridaOficial

**Arquivo:** `src/models/CorridaOficial.js`

**Propósito:** Gerenciar corridas oficiais da equipe.

**Campos:**
- `usuarioRegistroId` (ObjectId, obrigatório): Usuário que registrou a corrida
- `dataCadastro` (Date): Data de criação
- `dataAlteracao` (Date): Data da última alteração
- `dataCorrida` (Date, obrigatório): Data e hora da corrida
- `usuarios` (Array[ObjectId], obrigatório): Participantes da corrida
- `competicao` (ObjectId, obrigatório): Referência para a competição

**Índices:**
- `dataCorrida`: Para ordenação por data
- `usuarios`: Para consultas por participante
- `competicao`: Para consultas por competição
- `usuarioRegistroId`: Para consultas por usuário

## Controllers Implementados

### 1. CompeticaoController

**Arquivo:** `src/controllers/CompeticaoController.js`

**Endpoints:**
- `POST /competicoes` - Criar competição
- `GET /competicoes` - Listar competições
- `GET /competicoes/:id` - Buscar competição por ID
- `PUT /competicoes/:id` - Atualizar competição
- `DELETE /competicoes/:id` - Excluir competição

### 2. TreinoOficialController

**Arquivo:** `src/controllers/TreinoOficialController.js`

**Endpoints:**
- `POST /treinos-oficiais` - Criar treino oficial
- `GET /treinos-oficiais` - Listar treinos oficiais
- `GET /treinos-oficiais/:id` - Buscar treino oficial por ID
- `PUT /treinos-oficiais/:id` - Atualizar treino oficial
- `DELETE /treinos-oficiais/:id` - Excluir treino oficial

### 3. CorridaOficialController

**Arquivo:** `src/controllers/CorridaOficialController.js`

**Endpoints:**
- `POST /corridas-oficiais` - Criar corrida oficial
- `GET /corridas-oficiais` - Listar corridas oficiais
- `GET /corridas-oficiais/:id` - Buscar corrida oficial por ID
- `PUT /corridas-oficiais/:id` - Atualizar corrida oficial
- `DELETE /corridas-oficiais/:id` - Excluir corrida oficial

## Rotas Implementadas

### 1. Competição
**Arquivo:** `src/routes/competicao.js`
**Base URL:** `/competicoes`

### 2. Treino Oficial
**Arquivo:** `src/routes/treinoOficial.js`
**Base URL:** `/treinos-oficiais`

### 3. Corrida Oficial
**Arquivo:** `src/routes/corridaOficial.js`
**Base URL:** `/corridas-oficiais`

## Atualizações na Model Falta

A model `Falta` foi atualizada para trabalhar com as novas referências:

**Mudanças:**
- `tipoFalta` agora aceita apenas `'TREINO'` e `'CAMPEONATO'`
- `referenciaId` agora aponta para `TreinoOficial` ou `CorridaOficial`
- FaltaController atualizado para validar as novas referências

## Integração com a API

### Registro de Rotas
As novas rotas foram registradas no `app.js`:

```javascript
app.use('/competicoes', authMiddleware, userRateLimiter, competicaoRoutes);
app.use('/treinos-oficiais', authMiddleware, userRateLimiter, treinoOficialRoutes);
app.use('/corridas-oficiais', authMiddleware, userRateLimiter, corridaOficialRoutes);
```

### Documentação Swagger
Novas tags foram adicionadas ao Swagger:
- `Competição`
- `Treino Oficial`
- `Corrida Oficial`

## Validações Implementadas

### Competicao
- Nome obrigatório (máximo 100 caracteres)
- Data de início obrigatória e válida
- Arrays de grids e campeonatos não podem estar vazios
- Usuário que registra deve existir

### TreinoOficial
- Data do treino obrigatória e válida
- Array de usuários obrigatório e não vazio
- Todos os usuários participantes devem existir
- Usuário que registra deve existir

### CorridaOficial
- Data da corrida obrigatória e válida
- Array de usuários obrigatório e não vazio
- Competição obrigatória e deve existir
- Todos os usuários participantes devem existir
- Usuário que registra deve existir

## Benefícios da Nova Estrutura

1. **Organização:** Separação clara entre diferentes tipos de eventos
2. **Integridade Referencial:** Referências sempre apontam para entidades válidas
3. **Flexibilidade:** Suporte a múltiplos grids e campeonatos por competição
4. **Rastreabilidade:** Histórico completo de criação e alterações
5. **Performance:** Índices otimizados para consultas frequentes
6. **Escalabilidade:** Estrutura preparada para futuras expansões

## Exemplo de Uso

### Criar uma Competição
```json
POST /competicoes
{
  "nome": "Liga Brasileira 2024",
  "dataInicio": "2024-01-01",
  "grids": ["Amador", "Intermediário", "Pro"],
  "campeonatos": ["GT3", "GT4", "TCR"]
}
```

### Criar um Treino Oficial
```json
POST /treinos-oficiais
{
  "dataTreino": "2024-01-15T20:00:00Z",
  "usuarios": ["userId1", "userId2", "userId3"],
  "campeonato": "GT3"
}
```

### Criar uma Corrida Oficial
```json
POST /corridas-oficiais
{
  "dataCorrida": "2024-01-20T21:00:00Z",
  "usuarios": ["userId1", "userId2"],
  "competicao": "competicaoId"
}
```

### Registrar uma Falta
```json
POST /faltas
{
  "referenciaId": "treinoOficialId",
  "tipoFalta": "TREINO",
  "usuarioId": "userId",
  "tipo": "JUSTIFICADA",
  "justificativa": "Problemas técnicos"
}
``` 