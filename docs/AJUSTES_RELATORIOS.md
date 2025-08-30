# Ajustes nos Relatórios

## Visão Geral

Foram realizados ajustes importantes nos relatórios para se adequar às mudanças no modelo `Treino` e foi criado um novo relatório de faltas.

## Mudanças Realizadas

### 1. **Ajustes nos Relatórios Existentes**

#### Relatório de Performance
- **Antes**: Usava `Number` para `participacao` e `vitoria`
- **Depois**: Usa `Boolean` para `participacao` e `vitoria`
- **Removido**: Campos de falta (agora no modelo `Falta`)

#### Relatório Detalhado de Treinos
- **Ajustado**: Cálculos para trabalhar com boolean
- **Removido**: Análises de falta
- **Mantido**: Análises por simulador, pista e período

#### Relatório Geral da Equipe
- **Ajustado**: Cálculos de taxa de participação
- **Removido**: Referências a campos de falta

### 2. **Novo Relatório de Faltas**

#### Endpoint
```
GET /relatorios/usuario/{usuarioId}/faltas
```

#### Parâmetros de Filtro
- `tipoFalta`: TREINO, CAMPEONATO, REUNIAO, EVENTO
- `tipo`: JUSTIFICADA, NAO_JUSTIFICADA
- `periodoInicio`: Data de início (YYYY-MM-DD)
- `periodoFim`: Data de fim (YYYY-MM-DD)

#### Estrutura do Relatório

```javascript
{
    usuario: {
        id, nome, psnId, nivel, perfil
    },
    periodo: {
        inicio, fim
    },
    filtros: {
        tipoFalta, tipo
    },
    estatisticasGerais: {
        totalFaltas,
        totalJustificadas,
        totalNaoJustificadas,
        taxaJustificadas,
        tiposFalta
    },
    analisePorTipoFalta: {
        [TREINO]: { total, justificadas, naoJustificadas, taxaJustificadas },
        [CAMPEONATO]: { total, justificadas, naoJustificadas, taxaJustificadas }
    },
    analisePorPeriodo: {
        porMes: { "2024-01": 5, "2024-02": 3 },
        porSemana: { "2024-W01": 2, "2024-W02": 1 },
        porDiaSemana: { "Segunda": 10, "Terça": 5 }
    },
    justificativasComuns: [
        { justificativa: "Problema de saúde", count: 15 },
        { justificativa: "Problema técnico", count: 8 }
    ],
    detalhamentoFaltas: [
        {
            id, tipoFalta, tipo, justificativa,
            dataCadastro, dataAlteracao,
            usuarioRegistro, usuarioEdicao
        }
    ],
    resumo: {
        totalFaltas,
        taxaJustificadas,
        tipoMaisFrequente,
        mesComMaisFaltas
    }
}
```

## Exemplos de Uso

### Relatório de Faltas - Todos os Tipos
```javascript
GET /relatorios/usuario/665f1b2c2c8b2c001f7e4a1a/faltas
```

### Relatório de Faltas - Apenas Treinos
```javascript
GET /relatorios/usuario/665f1b2c2c8b2c001f7e4a1a/faltas?tipoFalta=TREINO
```

### Relatório de Faltas - Apenas Justificadas
```javascript
GET /relatorios/usuario/665f1b2c2c8b2c001f7e4a1a/faltas?tipo=JUSTIFICADA
```

### Relatório de Faltas - Período Específico
```javascript
GET /relatorios/usuario/665f1b2c2c8b2c001f7e4a1a/faltas?periodoInicio=2024-01-01&periodoFim=2024-01-31
```

### Relatório de Faltas - Combinação de Filtros
```javascript
GET /relatorios/usuario/665f1b2c2c8b2c001f7e4a1a/faltas?tipoFalta=TREINO&tipo=JUSTIFICADA&periodoInicio=2024-01-01&periodoFim=2024-01-31
```

## Tipos de Relatórios Disponíveis

### 1. **Relatório de Performance**
- **URL**: `/relatorios/usuario/{usuarioId}/performance`
- **Descrição**: Relatório geral de performance do usuário
- **Parâmetros**: `periodoInicio`, `periodoFim`

### 2. **Relatório Detalhado de Treinos**
- **URL**: `/relatorios/usuario/{usuarioId}/treinos`
- **Descrição**: Relatório detalhado de treinos do usuário
- **Parâmetros**: `simulador`, `pista`, `periodoInicio`, `periodoFim`

### 3. **Relatório Detalhado de Corridas**
- **URL**: `/relatorios/usuario/{usuarioId}/corridas`
- **Descrição**: Relatório detalhado de corridas do usuário
- **Parâmetros**: `liga`, `simulador`, `periodoInicio`, `periodoFim`

### 4. **Relatório Detalhado de Faltas** ⭐ **NOVO**
- **URL**: `/relatorios/usuario/{usuarioId}/faltas`
- **Descrição**: Relatório detalhado de faltas do usuário
- **Parâmetros**: `tipoFalta`, `tipo`, `periodoInicio`, `periodoFim`

### 5. **Relatório Comparativo**
- **URL**: `/relatorios/comparativo`
- **Descrição**: Comparação entre múltiplos usuários
- **Parâmetros**: `usuarioIds`, `periodoInicio`, `periodoFim`

### 6. **Relatório Geral da Equipe**
- **URL**: `/relatorios/equipe`
- **Descrição**: Relatório geral com todos os pilotos
- **Parâmetros**: `periodoInicio`, `periodoFim`, `nivel`, `perfil`, `ativo`

## Vantagens dos Ajustes

1. **Consistência**: Todos os relatórios agora usam os tipos corretos (boolean)
2. **Precisão**: Cálculos mais precisos com boolean
3. **Separação**: Faltas em relatório próprio
4. **Flexibilidade**: Filtros específicos para faltas
5. **Análise Detalhada**: Análises por tipo, período e justificativas

## Análises Disponíveis no Relatório de Faltas

### 1. **Análise por Tipo de Falta**
- TREINO: Faltas em treinos
- CAMPEONATO: Faltas em corridas
- REUNIAO: Faltas em reuniões
- EVENTO: Faltas em eventos

### 2. **Análise por Período**
- Por mês
- Por semana
- Por dia da semana

### 3. **Análise de Justificativas**
- Top 10 justificativas mais comuns
- Contagem de cada justificativa

### 4. **Estatísticas Gerais**
- Total de faltas
- Taxa de justificadas vs não justificadas
- Distribuição por tipo

## Próximos Passos

1. Testar todos os relatórios com a nova estrutura
2. Implementar gráficos no frontend para visualização
3. Adicionar exportação para PDF/Excel
4. Implementar relatórios de equipe incluindo faltas 