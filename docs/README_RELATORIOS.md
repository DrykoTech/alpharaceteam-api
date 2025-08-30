# 📊 Sistema de Relatórios - Alpha Race Team API

Este documento descreve o sistema de relatórios implementado na API Alpha Race Team, que permite gerar análises detalhadas de treinos e histórico de corridas dos usuários.

## 🎯 Visão Geral

O sistema de relatórios oferece **5 tipos principais de relatórios**:

1. **Relatório Geral de Performance** - Visão consolidada de treinos e corridas de um piloto
2. **Relatório Detalhado de Treinos** - Análise específica de treinos de um piloto
3. **Relatório Detalhado de Corridas** - Análise específica de corridas de um piloto
4. **Relatório Comparativo** - Comparação entre múltiplos usuários específicos
5. **Relatório Geral da Equipe** - Análise completa de TODOS os pilotos da equipe

## 🚀 Endpoints Disponíveis

### 1. Relatório Geral de Performance
```
GET /relatorios/performance/{usuarioId}
```

**Parâmetros:**
- `usuarioId` (path): ID do usuário
- `periodoInicio` (query): Data de início (YYYY-MM-DD)
- `periodoFim` (query): Data de fim (YYYY-MM-DD)

**Exemplo de uso:**
```bash
GET /relatorios/performance/507f1f77bcf86cd799439011?periodoInicio=2024-01-01&periodoFim=2024-12-31
```

### 2. Relatório Detalhado de Treinos
```
GET /relatorios/treinos/{usuarioId}
```

**Parâmetros:**
- `usuarioId` (path): ID do usuário
- `simulador` (query): Filtrar por simulador específico
- `pista` (query): Filtrar por pista específica
- `periodoInicio` (query): Data de início (YYYY-MM-DD)
- `periodoFim` (query): Data de fim (YYYY-MM-DD)

**Exemplo de uso:**
```bash
GET /relatorios/treinos/507f1f77bcf86cd799439011?simulador=Assetto%20Corsa&periodoInicio=2024-01-01
```

### 3. Relatório Detalhado de Corridas
```
GET /relatorios/corridas/{usuarioId}
```

**Parâmetros:**
- `usuarioId` (path): ID do usuário
- `liga` (query): Filtrar por liga específica
- `simulador` (query): Filtrar por simulador específico
- `periodoInicio` (query): Data de início (YYYY-MM-DD)
- `periodoFim` (query): Data de fim (YYYY-MM-DD)

**Exemplo de uso:**
```bash
GET /relatorios/corridas/507f1f77bcf86cd799439011?liga=Liga%20Alpha&periodoInicio=2024-01-01
```

### 4. Relatório Comparativo
```
GET /relatorios/comparativo
```

**Parâmetros:**
- `usuarioIds` (query): IDs dos usuários separados por vírgula
- `periodoInicio` (query): Data de início (YYYY-MM-DD)
- `periodoFim` (query): Data de fim (YYYY-MM-DD)

**Exemplo de uso:**
```bash
GET /relatorios/comparativo?usuarioIds=507f1f77bcf86cd799439011,507f1f77bcf86cd799439012&periodoInicio=2024-01-01
```

### 5. Relatório Geral da Equipe
```
GET /relatorios/equipe
```

**Parâmetros:**
- `periodoInicio` (query): Data de início (YYYY-MM-DD)
- `periodoFim` (query): Data de fim (YYYY-MM-DD)
- `nivel` (query): Filtrar por nível (Iniciante, Intermediário, Avançado)
- `perfil` (query): Filtrar por perfil (Competitivo, Casual, etc.)
- `ativo` (query): Filtrar por status ativo (true/false)

**Exemplo de uso:**
```bash
GET /relatorios/equipe?periodoInicio=2024-01-01&nivel=Intermediário&ativo=true
```

## 📈 Dados Analisados

### Relatório Geral de Performance
- **Estatísticas de Treino:**
  - Total de treinos
  - Total de participações
  - Total de vitórias
  - Total de faltas (justificadas e não justificadas)
  - Total de desistências
  - Taxa de vitória
  - Taxa de desistência
  - Simuladores utilizados
  - Pistas treinadas

- **Estatísticas de Corrida:**
  - Total de corridas
  - Total de pontuação
  - Pontuação média
  - Vitórias e pódios
  - Contagem de VMR
  - Melhor e pior posições
  - Ligas participadas

- **Evolução Temporal:**
  - Treinos por mês
  - Corridas por mês
  - Pontuação por mês

- **Resumo Geral:**
  - Total de atividades
  - Taxa de participação
  - Taxa de desistência
  - Performance geral

### Relatório Detalhado de Treinos
- **Análise por Simulador:**
  - Total de treinos por simulador
  - Total de desistências por simulador
  - Taxa de vitória por simulador
  - Taxa de desistência por simulador
  - Pistas utilizadas em cada simulador

- **Análise por Pista:**
  - Total de treinos por pista
  - Total de desistências por pista
  - Taxa de desistência por pista
  - Melhor volta por pista
  - Simuladores utilizados em cada pista

- **Frequência por Período:**
  - Treinos por mês
  - Treinos por semana
  - Treinos por dia da semana

### Relatório Detalhado de Corridas
- **Análise por Liga:**
  - Total de corridas por liga
  - Pontuação média por liga
  - Taxa de vitória e pódio por liga
  - Melhor e pior posições por liga
  - Etapas participadas

- **Análise por Simulador:**
  - Performance por simulador
  - Ligas participadas em cada simulador

- **Evolução por Etapa:**
  - Progressão ao longo das etapas
  - Evolução de posição (largada vs chegada)

### Relatório Comparativo
- **Comparação entre Usuários:**
  - Estatísticas individuais
  - Performance geral
  - Ranking baseado em score

### Relatório Geral da Equipe
- **Estatísticas Gerais da Equipe:**
  - Total de pilotos
  - Total de treinos e corridas
  - Pontuação média da equipe
  - Taxa de vitória da equipe
  - Simuladores, pistas e ligas utilizadas

- **Análise por Nível:**
  - Performance por nível (Iniciante, Intermediário, Avançado)
  - Estatísticas agrupadas por categoria

- **Ranking Completo:**
  - Todos os pilotos ordenados por performance
  - Dados individuais de cada piloto
  - Comparação direta entre membros da equipe

## 🔧 Funcionalidades Avançadas

### Filtros Temporais
Todos os relatórios suportam filtros por período:
- **Período específico:** Definir data de início e fim
- **Todas as datas:** Quando não especificado, analisa todo o histórico

### Filtros Específicos
- **Simulador:** Filtrar por simulador específico
- **Pista:** Filtrar por pista específica (treinos)
- **Liga:** Filtrar por liga específica (corridas)

### Cálculos Automáticos
- **Taxa de vitória:** (Vitórias / Participações) × 100
- **Taxa de desistência:** (Desistências / Total de treinos) × 100
- **Taxa de participação:** ((Participações - Faltas) / Participações) × 100
- **Performance geral:** (Pontuação média / 25) × 100
- **Evolução de posição:** Posição de chegada - Posição de largada

## 📊 Exemplo de Resposta

```json
{
  "success": true,
  "message": "Relatório de performance gerado com sucesso",
  "data": {
    "usuario": {
      "id": "507f1f77bcf86cd799439011",
      "nome": "João Silva",
      "psnId": "joao_racer",
      "nivel": "Intermediário",
      "perfil": "Competitivo",
      "plataforma": "PS5"
    },
    "periodo": {
      "inicio": "01/01/2024",
      "fim": "31/12/2024"
    },
    "estatisticasTreino": {
      "totalTreinos": 25,
      "totalParticipacoes": 100,
      "totalVitorias": 15,
      "totalFaltas": 5,
      "totalDesistencias": 2,
      "taxaVitoria": "15.00%",
      "taxaDesistencia": "8.00%",
      "simuladoresUtilizados": ["Assetto Corsa", "Gran Turismo 7"],
      "pistasTreinadas": ["Interlagos", "Monza", "Spa"]
    },
    "estatisticasCorrida": {
      "totalCorridas": 12,
      "totalPontuacao": 180,
      "pontuacaoMedia": "15.00",
      "vitorias": 2,
      "podios": 5,
      "vmrCount": 8,
      "melhorPosicao": 1,
      "piorPosicao": 15,
      "ligasParticipadas": ["Liga Alpha", "Liga Beta"],
      "simuladoresUtilizados": ["Assetto Corsa"]
    },
    "evolucaoTemporal": {
      "treinosPorMes": {
        "2024-01": 5,
        "2024-02": 8,
        "2024-03": 12
      },
      "corridasPorMes": {
        "2024-01": 2,
        "2024-02": 4,
        "2024-03": 6
      },
      "pontuacaoPorMes": {
        "2024-01": 30,
        "2024-02": 60,
        "2024-03": 90
      }
    },
    "resumo": {
      "totalAtividades": 37,
      "taxaParticipacao": "95.00%",
      "taxaDesistencia": "8.00%",
      "performanceGeral": "60.00%"
    }
  }
}
```

## 🔐 Autenticação

Todos os endpoints de relatório requerem autenticação via **Bearer Token JWT**:

```bash
Authorization: Bearer <seu_token_jwt>
```

## 📝 Notas Importantes

1. **Formato de Datas:** Use o formato YYYY-MM-DD para filtros temporais
2. **IDs de Usuário:** Separe múltiplos IDs por vírgula no relatório comparativo
3. **Filtros Opcionais:** Todos os filtros são opcionais, exceto o ID do usuário
4. **Performance:** Relatórios com muitos dados podem levar alguns segundos
5. **Limites:** Não há limites específicos, mas recomenda-se períodos razoáveis

## 🚀 Como Usar

1. **Faça login** para obter o token JWT
2. **Escolha o tipo de relatório** desejado
3. **Configure os filtros** conforme necessário
4. **Faça a requisição** com o token de autenticação
5. **Analise os dados** retornados

## 📚 Documentação Completa

Para documentação completa da API, incluindo todos os endpoints, acesse:
```
GET /swagger
```

---

**Desenvolvido para Alpha Race Team** 🏁 