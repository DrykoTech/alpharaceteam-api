# Migração das Faltas - Modelo Genérico

## Visão Geral

A estrutura de faltas foi refatorada para um modelo genérico que pode ser reutilizado para diferentes tipos de faltas (treinos, campeonatos, reuniões, eventos, etc.).

## Mudanças Realizadas

### 1. Novo Modelo `Falta`

```javascript
{
    referenciaId: ObjectId,        // ID da referência (Treino, HistoricoCorrida, etc.)
    tipoFalta: String,             // 'TREINO', 'CAMPEONATO', 'REUNIAO', 'EVENTO'
    usuarioId: ObjectId,           // Usuário que faltou
    tipo: String,                  // 'JUSTIFICADA' ou 'NAO_JUSTIFICADA'
    justificativa: String,         // Justificativa detalhada
    usuarioRegistroId: ObjectId,   // Usuário que registrou a falta
    dataCadastro: Date,
    dataAlteracao: Date,
    usuarioEdicaoId: ObjectId
}
```

### 2. Modelo `Treino` Simplificado

Removidas as propriedades:
- `falta`
- `faltaJustificada`
- `faltaNaoJustificada`
- `justificativaFalta`

### 3. Novas Rotas Disponíveis

#### Faltas Gerais
- `GET /faltas` - Lista todas as faltas com paginação e filtros
- `POST /faltas` - Registra uma nova falta

#### Faltas por Usuário
- `GET /faltas/usuario/:usuarioId` - Faltas de um usuário específico
- `GET /faltas/usuario/:usuarioId?tipoFalta=TREINO` - Faltas de treino de um usuário

#### Faltas por Referência
- `GET /faltas/referencia/TREINO/:treinoId` - Faltas de um treino específico
- `GET /faltas/referencia/CAMPEONATO/:historicoId` - Faltas de uma corrida específica

#### Operações CRUD
- `GET /faltas/:id` - Busca uma falta por ID
- `PUT /faltas/:id` - Atualiza uma falta
- `DELETE /faltas/:id` - Remove uma falta

## Exemplos de Uso

### Registrar Falta em Treino

```javascript
POST /faltas
{
    "referenciaId": "665f1b2c2c8b2c001f7e4a1a",
    "tipoFalta": "TREINO",
    "usuarioId": "665f1b2c2c8b2c001f7e4a1b",
    "tipo": "JUSTIFICADA",
    "justificativa": "Problema de saúde"
}
```

### Registrar Falta em Campeonato

```javascript
POST /faltas
{
    "referenciaId": "665f1b2c2c8b2c001f7e4a1c",
    "tipoFalta": "CAMPEONATO",
    "usuarioId": "665f1b2c2c8b2c001f7e4a1b",
    "tipo": "NAO_JUSTIFICADA",
    "justificativa": "Não compareceu sem aviso prévio"
}
```

### Buscar Faltas de um Treino

```javascript
GET /faltas/referencia/TREINO/665f1b2c2c8b2c001f7e4a1a
```

### Buscar Todas as Faltas de um Usuário

```javascript
GET /faltas/usuario/665f1b2c2c8b2c001f7e4a1b
```

### Filtrar Faltas por Tipo

```javascript
GET /faltas?tipoFalta=TREINO&tipo=JUSTIFICADA
```

## Vantagens da Nova Estrutura

1. **Flexibilidade**: Pode ser usado para qualquer tipo de falta
2. **Escalabilidade**: Fácil adicionar novos tipos de falta
3. **Histórico Completo**: Mantém registro de todas as ausências
4. **Consultas Eficientes**: Índices otimizados para diferentes tipos de busca
5. **Separação de Responsabilidades**: Cada modelo tem sua função específica
6. **Reutilização**: Mesma estrutura para diferentes contextos

## Migração de Dados Existentes

Para migrar dados existentes do modelo `Treino` para o novo modelo `Falta`, será necessário criar um script de migração que:

1. Busque todos os treinos com faltas
2. Crie registros no modelo `Falta` para cada falta existente
3. Mantenha a integridade referencial

## Próximos Passos

1. Implementar script de migração de dados existentes
2. Atualizar frontend para usar a nova estrutura
3. Adicionar validações específicas por tipo de falta
4. Implementar relatórios de faltas por período/tipo 