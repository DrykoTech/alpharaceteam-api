# Changelog - Implementação de Datas Brasileiras

## Resumo das Alterações

Implementação de datas brasileiras em todos os endpoints de criação e alteração da API Alpha Race Team.

## Arquivos Modificados

### 1. `src/utils/DateFormatter.js`
- **Adicionado**: Função `obterDataAtual()` para gerar a data atual como objeto Date
- **Correção**: Mantém compatibilidade com MongoDB salvando como Date, formatando apenas na resposta

### 2. `src/controllers/UsuarioController.js`
- **Importação**: Adicionado `obterDataAtual` do DateFormatter
- **Método `create`**: 
  - Adicionado `createdAt: obterDataAtual()`
  - Adicionado `updatedAt: obterDataAtual()`
- **Método `update`**: 
  - Alterado `updatedAt: new Date()` para `updatedAt: obterDataAtual()`
- **Método `toggleAtivo`**: 
  - Alterado `updatedAt: new Date()` para `updatedAt: obterDataAtual()`
- **Método `alterarSenha`**: 
  - Alterado `updatedAt: new Date()` para `updatedAt: obterDataAtual()`
  - Corrigido problema de validação do campo `ativo` usando `runValidators: false`

### 3. `src/controllers/EnderecoController.js`
- **Importação**: Adicionado `obterDataAtual` do DateFormatter
- **Método `create`**: 
  - Adicionado `createdAt: obterDataAtual()`
  - Adicionado `updatedAt: obterDataAtual()`
- **Método `update`**: 
  - Alterado `updatedAt: new Date()` para `updatedAt: obterDataAtual()`

### 4. `src/controllers/HistoricoCorridaController.js`
- **Importação**: Adicionado `obterDataAtual` do DateFormatter
- **Método `create`**: 
  - Adicionado `createdAt: obterDataAtual()`
  - Adicionado `updatedAt: obterDataAtual()`
- **Método `update`**: 
  - Alterado `updatedAt: new Date()` para `updatedAt: obterDataAtual()`

### 5. `src/controllers/TreinoController.js`
- **Importação**: Adicionado `obterDataAtual` do DateFormatter
- **Método `create`**: 
  - Adicionado `dataCadastro: obterDataAtual()`
  - Adicionado `dataAlteracao: obterDataAtual()`
  - Adicionado validação e suporte para campo `simulador` (string)
- **Método `update`**: 
  - Adicionado `dataAlteracao: obterDataAtual()`
  - Adicionado suporte para campo `simulador` (string)

### 6. `src/controllers/LogController.js`
- **Importação**: Adicionado `obterDataAtual` do DateFormatter
- **Método `criarLog`**: 
  - Adicionado `createdAt: obterDataAtual()` na criação de logs

### 7. `src/models/Treino.js`
- **Middleware**: Modificado para não sobrescrever datas definidas manualmente
- **Pre-save**: Só atualiza `dataAlteracao` se não foi definido manualmente
- **Pre-findOneAndUpdate**: Só atualiza `dataAlteracao` se não foi definido manualmente
- **Campo `simulador`**: Adicionado campo obrigatório do tipo string com validação

## Benefícios das Alterações

1. **Consistência**: Todas as datas são salvas como Date no MongoDB e formatadas como brasileira na resposta
2. **Padronização**: Formato uniforme em toda a aplicação
3. **Correção de Bug**: Resolvido problema de validação no endpoint `alterarSenha`
4. **Flexibilidade**: Middleware do Treino não interfere com datas definidas manualmente
5. **Compatibilidade**: Mantém compatibilidade com MongoDB salvando como Date

## Formato de Data Utilizado

- **Salvamento**: Objeto `Date` no MongoDB
- **Exibição**: `DD/MM/YYYY HH:mm:ss` (formato brasileiro)
- **Exemplo**: `25/12/2024 14:30:45`
- **Locale**: `pt-BR`

## Endpoints Afetados

### Criação (POST):
- `/usuarios` - Criação de usuário
- `/enderecos` - Criação de endereço
- `/historicos-corrida` - Criação de histórico de corrida
- `/treinos` - Criação de treino (com campo `simulador` obrigatório)

### Atualização (PUT/PATCH):
- `/usuarios/{id}` - Atualização de usuário
- `/usuarios/{id}/toggle-ativo` - Alteração de status
- `/usuarios/{id}/alterar-senha` - Alteração de senha
- `/enderecos/{id}` - Atualização de endereço
- `/historicos-corrida/{id}` - Atualização de histórico
- `/treinos/{id}` - Atualização de treino (com suporte ao campo `simulador`)

## Padronização de Retornos da API

### ✅ **Controllers Padronizados:**
- **UsuarioController** - 100% padronizado
- **AuthController** - 100% padronizado  
- **EnderecoController** - 100% padronizado
- **HistoricoCorridaController** - 100% padronizado
- **LogController** - 100% padronizado
- **TreinoController** - 100% padronizado
- **FilaEmailController** - ✅ Corrigido e padronizado
- **app.js** - ✅ Corrigido e padronizado

### **Correções Realizadas:**
1. **FilaEmailController**: Adicionado `res.status(200)` em todos os retornos de sucesso
2. **app.js**: 
   - Rota `/health` agora usa `ApiResponse`
   - Middleware de erro agora usa `ApiResponse`
3. **Todos os Controllers**: Adicionado `return` em todos os `res.status().json()` para garantir que a execução pare após enviar a resposta

### **Formato Padronizado:**
```json
{
    "success": true/false,
    "message": "Mensagem descritiva",
    "data": { ... }, // opcional
    "error": { ... } // opcional
}
```

## Data de Implementação

**Data**: 25/12/2024
**Versão**: 1.0.0 