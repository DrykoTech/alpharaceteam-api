# Changelog - Endpoints de Relatórios

## Versão 2.0.0 - Padronização dos Endpoints

### Mudanças Realizadas

#### 1. Refatoração da Estrutura de URLs

**Antes:**
```
GET /relatorios/performance/:usuarioId
GET /relatorios/treinos/:usuarioId
GET /relatorios/corridas/:usuarioId
GET /relatorios/comparativo
GET /relatorios/equipe
```

**Depois:**
```
GET /relatorios
GET /relatorios/usuario/:usuarioId/performance
GET /relatorios/usuario/:usuarioId/treinos
GET /relatorios/usuario/:usuarioId/corridas
GET /relatorios/comparativo
GET /relatorios/equipe
```

#### 2. Novo Endpoint de Listagem

- **`GET /relatorios`** - Lista todos os tipos de relatórios disponíveis
  - Mostra apenas os relatórios que o usuário tem permissão para acessar
  - Inclui informações sobre parâmetros e restrições de cada tipo
  - Segue o padrão `GET /` dos outros módulos

#### 3. Padronização com Outros Módulos

Agora os endpoints de relatórios seguem o mesmo padrão dos outros módulos da API:

- **Usuários:** `GET /usuarios` (lista todos)
- **Treinos:** `GET /treinos` (lista todos), `GET /treinos/usuario/:usuarioId`
- **Históricos:** `GET /historicos-corrida` (lista todos), `GET /historicos-corrida/usuario/:usuarioId`
- **Endereços:** `GET /enderecos` (lista todos), `GET /enderecos/usuario/:usuarioId`
- **Relatórios:** `GET /relatorios` (lista tipos), `GET /relatorios/usuario/:usuarioId/performance`

#### 4. Melhorias de Segurança

- Adicionadas verificações de permissão em todos os endpoints
- Usuários comuns só podem acessar seus próprios dados
- Apenas administradores podem acessar dados de outros usuários
- Endpoints comparativos e de equipe restritos a administradores

#### 5. Documentação Atualizada

- Swagger docs atualizados com as novas URLs
- Adicionados códigos de erro 403 (Forbidden) na documentação
- Melhor descrição dos parâmetros e respostas

### Impacto nas Integrações

#### Endpoints Afetados

1. **Relatório de Performance:**
   - Antes: `GET /relatorios/performance/123`
   - Depois: `GET /relatorios/usuario/123/performance`

2. **Relatório de Treinos:**
   - Antes: `GET /relatorios/treinos/123`
   - Depois: `GET /relatorios/usuario/123/treinos`

3. **Relatório de Corridas:**
   - Antes: `GET /relatorios/corridas/123`
   - Depois: `GET /relatorios/usuario/123/corridas`

#### Endpoints Não Afetados

- `GET /relatorios/comparativo` - Mantido igual
- `GET /relatorios/equipe` - Mantido igual

#### Novo Endpoint

- `GET /relatorios` - Novo endpoint para listar tipos disponíveis

### Migração

Para migrar aplicações existentes:

1. **Atualizar URLs** nos clientes/frontend
2. **Verificar permissões** - agora há controle de acesso mais rigoroso
3. **Tratar erro 403** - novo código de erro para acessos negados
4. **Usar novo endpoint** `GET /relatorios` para descobrir tipos disponíveis

### Benefícios

1. **Consistência** - Padrão uniforme em toda a API
2. **Manutenibilidade** - Estrutura mais clara e organizada
3. **Segurança** - Controle de acesso adequado
4. **Escalabilidade** - Facilita adição de novos tipos de relatórios
5. **Descoberta** - Endpoint para listar tipos disponíveis

### Exemplo de Uso

```javascript
// Listar tipos disponíveis
const tipos = await fetch('/api/relatorios');

// Usar relatório específico
const relatorio = await fetch('/api/relatorios/usuario/123/performance');
```

### Próximos Passos

- [x] Adicionar endpoint `GET /relatorios` para listar tipos disponíveis
- [ ] Implementar cache para relatórios pesados
- [ ] Adicionar paginação para relatórios grandes
- [ ] Criar endpoints para relatórios em lote 