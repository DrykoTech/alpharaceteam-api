# Ajustes no Modelo Treino

## Visão Geral

Foram realizados ajustes importantes no modelo `Treino` para melhorar a semântica e a estrutura dos dados.

## Mudanças Realizadas

### 1. Propriedade `participacao`

**Antes:**
```javascript
participacao: { 
    type: Number, 
    required: true,
    min: 0 
}
```

**Depois:**
```javascript
participacao: { 
    type: Boolean, 
    default: true 
}
```

**Justificativa:**
- Se o treino foi cadastrado, significa que o piloto participou
- Não faz sentido ser `Number` nem vir do front
- Deveria ser `true` automaticamente na criação
- Removido do `required` pois agora tem valor padrão

### 2. Propriedade `vitoria`

**Antes:**
```javascript
vitoria: { 
    type: Number, 
    required: true,
    min: 0 
}
```

**Depois:**
```javascript
vitoria: { 
    type: Boolean, 
    required: true 
}
```

**Justificativa:**
- Faz mais sentido ser `Boolean` (true/false)
- Deve vir do front pois é uma informação que precisa ser informada
- Mais semântico que `Number`

### 3. Propriedades de Falta Removidas

Foram removidas as seguintes propriedades do modelo `Treino`:
- `falta`
- `faltaJustificada`
- `faltaNaoJustificada`
- `justificativaFalta`

**Justificativa:**
- Essas informações agora estão no modelo genérico `Falta`
- Melhor separação de responsabilidades
- Permite múltiplas faltas por treino

## Impacto no Controller

### 1. Método `create`

**Campos removidos da validação:**
- `participacao` (agora é `true` por padrão)
- `falta`, `faltaJustificada`, `faltaNaoJustificada`, `justificativaFalta`

**Campos obrigatórios atualizados:**
```javascript
// Antes
if (!usuarioId || !campeonato || !pista || !melhorVolta || participacao === undefined || vitoria === undefined || !simulador || !dataTreino)

// Depois
if (!usuarioId || !campeonato || !pista || !melhorVolta || vitoria === undefined || !simulador || !dataTreino)
```

### 2. Método `update`

**Campos removidos:**
- `participacao` (não deve ser editável)
- `falta`, `faltaJustificada`, `faltaNaoJustificada`, `justificativaFalta`

### 3. Método `getEstatisticas`

**Cálculos atualizados:**
```javascript
// Antes (Number)
totalParticipacoes: treinos.reduce((sum, treino) => sum + treino.participacao, 0),
totalVitorias: treinos.reduce((sum, treino) => sum + treino.vitoria, 0),

// Depois (Boolean)
totalParticipacoes: treinos.reduce((sum, treino) => sum + (treino.participacao ? 1 : 0), 0),
totalVitorias: treinos.reduce((sum, treino) => sum + (treino.vitoria ? 1 : 0), 0),
```

## Exemplos de Uso

### Criar Treino

```javascript
POST /treinos
{
    "usuarioId": "665f1b2c2c8b2c001f7e4a1a",
    "campeonato": "Campeonato Brasileiro",
    "pista": "Interlagos",
    "melhorVolta": "1:30.123",
    "vitoria": true,
    "simulador": "Assetto Corsa",
    "dataTreino": "2024-01-15T10:00:00Z"
}
```

**Resultado:**
- `participacao` será automaticamente `true`
- `vitoria` será `true` conforme enviado
- Não há mais campos de falta

### Atualizar Treino

```javascript
PUT /treinos/:id
{
    "vitoria": false,
    "melhorVolta": "1:29.987"
}
```

## Vantagens dos Ajustes

1. **Semântica Correta**: `participacao` e `vitoria` como boolean fazem mais sentido
2. **Automação**: `participacao` é definida automaticamente
3. **Simplicidade**: Menos campos para gerenciar no frontend
4. **Separação de Responsabilidades**: Faltas em modelo próprio
5. **Flexibilidade**: Estrutura mais limpa e extensível

## Migração de Dados

Para migrar dados existentes, será necessário:

1. Converter valores numéricos de `participacao` para boolean:
   - `0` → `false`
   - `> 0` → `true`

2. Converter valores numéricos de `vitoria` para boolean:
   - `0` → `false`
   - `> 0` → `true`

3. Migrar dados de falta para o modelo `Falta`

## Próximos Passos

1. Implementar script de migração de dados existentes
2. Atualizar frontend para usar os novos tipos
3. Testar todas as funcionalidades com a nova estrutura 