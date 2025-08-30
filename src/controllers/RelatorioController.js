const { Treino } = require('../models/Treino');
const { HistoricoCorrida } = require('../models/HistoricoCorrida');
const { Falta } = require('../models/Falta');
const Usuario = require('../models/Usuario');
const ApiResponse = require('../models/ApiResponse');
const { formatarDataBrasileira } = require('../utils/DateFormatter');

const RelatorioController = {
    // Listar tipos de relatórios disponíveis
    async getAll(req, res) {
        try {
            const usuarioLogado = req.usuario;
            const tiposRelatorios = [];

            // Relatórios disponíveis para todos os usuários autenticados
            tiposRelatorios.push({
                tipo: 'performance',
                nome: 'Relatório de Performance',
                descricao: 'Relatório geral de performance do usuário',
                url: `/relatorios/usuario/{usuarioId}/performance`,
                parametros: ['periodoInicio', 'periodoFim'],
                restricoes: 'Acesso livre para usuários autenticados'
            });

            tiposRelatorios.push({
                tipo: 'treinos',
                nome: 'Relatório Detalhado de Treinos',
                descricao: 'Relatório detalhado de treinos do usuário',
                url: `/relatorios/usuario/{usuarioId}/treinos`,
                parametros: ['simulador', 'pista', 'periodoInicio', 'periodoFim'],
                restricoes: 'Acesso livre para usuários autenticados'
            });

            tiposRelatorios.push({
                tipo: 'corridas',
                nome: 'Relatório Detalhado de Corridas',
                descricao: 'Relatório detalhado de corridas do usuário',
                url: `/relatorios/usuario/{usuarioId}/corridas`,
                parametros: ['liga', 'simulador', 'periodoInicio', 'periodoFim'],
                restricoes: 'Acesso livre para usuários autenticados'
            });

            tiposRelatorios.push({
                tipo: 'faltas',
                nome: 'Relatório Detalhado de Faltas',
                descricao: 'Relatório detalhado de faltas do usuário',
                url: `/relatorios/usuario/{usuarioId}/faltas`,
                parametros: ['tipoFalta', 'tipo', 'periodoInicio', 'periodoFim'],
                restricoes: 'Acesso livre para usuários autenticados'
            });

            // Relatórios disponíveis para todos os usuários autenticados
            tiposRelatorios.push({
                tipo: 'comparativo',
                nome: 'Relatório Comparativo',
                descricao: 'Comparação entre múltiplos usuários',
                url: `/relatorios/comparativo`,
                parametros: ['usuarioIds', 'periodoInicio', 'periodoFim'],
                restricoes: 'Acesso livre para usuários autenticados'
            });

            tiposRelatorios.push({
                tipo: 'equipe',
                nome: 'Relatório Geral da Equipe',
                descricao: 'Relatório geral com todos os pilotos',
                url: `/relatorios/equipe`,
                parametros: ['periodoInicio', 'periodoFim', 'nivel', 'perfil', 'ativo'],
                restricoes: 'Acesso livre para usuários autenticados'
            });

            return res.status(200).json(new ApiResponse(true, 'Tipos de relatórios disponíveis', {
                usuario: {
                    id: usuarioLogado.id,
                    perfil: usuarioLogado.perfil
                },
                relatorios: tiposRelatorios,
                total: tiposRelatorios.length
            }));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao listar tipos de relatórios', null, { error: err.message }));
        }
    },

    // Relatório Geral de Performance do Usuário
    async relatorioPerformanceUsuario(req, res) {
        try {
            const { usuarioId } = req.params;
            const { periodoInicio, periodoFim } = req.query;

            // Verificar se o usuário existe
            const usuario = await Usuario.findById(usuarioId);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            }

            // Construir filtros de data se fornecidos
            let filtroData = {};
            if (periodoInicio && periodoFim) {
                filtroData = {
                    $gte: new Date(periodoInicio),
                    $lte: new Date(periodoFim)
                };
            }

            // Buscar dados de treino
            const treinos = await Treino.find({ 
                usuarioId, 
                dataTreino: filtroData 
            }).sort({ dataTreino: -1 });

            // Buscar dados de histórico de corrida
            const historicos = await HistoricoCorrida.find({ 
                usuarioId, 
                dataCorrida: filtroData 
            }).sort({ dataCorrida: -1 });

            // Calcular estatísticas de treino
            const estatisticasTreino = {
                totalTreinos: treinos.length,
                totalParticipacoes: treinos.reduce((sum, t) => sum + (t.participacao ? 1 : 0), 0),
                totalVitorias: treinos.reduce((sum, t) => sum + (t.vitoria ? 1 : 0), 0),
                totalDesistencias: treinos.reduce((sum, t) => sum + (t.desistencia ? 1 : 0), 0),
                taxaVitoria: treinos.length > 0 ? 
                    (treinos.reduce((sum, t) => sum + (t.vitoria ? 1 : 0), 0) / treinos.length * 100).toFixed(2) + '%' : '0%',
                taxaDesistencia: treinos.length > 0 ? 
                    (treinos.reduce((sum, t) => sum + (t.desistencia ? 1 : 0), 0) / treinos.length * 100).toFixed(2) + '%' : '0%',
                simuladoresUtilizados: [...new Set(treinos.map(t => t.simulador))],
                pistasTreinadas: [...new Set(treinos.map(t => t.pista))]
            };

            // Calcular estatísticas de corrida
            const estatisticasCorrida = {
                totalCorridas: historicos.length,
                totalPontuacao: historicos.reduce((sum, h) => sum + h.pontuacao, 0),
                pontuacaoMedia: historicos.length > 0 ? 
                    (historicos.reduce((sum, h) => sum + h.pontuacao, 0) / historicos.length).toFixed(2) : 0,
                vitorias: historicos.filter(h => h.posicaoChegada === 1).length,
                podios: historicos.filter(h => h.posicaoChegada <= 3).length,
                vmrCount: historicos.filter(h => h.vmr).length,
                melhorPosicao: historicos.length > 0 ? Math.min(...historicos.map(h => h.posicaoChegada)) : null,
                piorPosicao: historicos.length > 0 ? Math.max(...historicos.map(h => h.posicaoChegada)) : null,
                ligasParticipadas: [...new Set(historicos.map(h => h.liga))],
                simuladoresUtilizados: [...new Set(historicos.map(h => h.simulador))]
            };

            // Análise de evolução temporal
            const evolucaoTemporal = {
                treinosPorMes: {},
                corridasPorMes: {},
                pontuacaoPorMes: {}
            };

            treinos.forEach(treino => {
                const mes = treino.dataTreino.toISOString().substring(0, 7); // YYYY-MM
                evolucaoTemporal.treinosPorMes[mes] = (evolucaoTemporal.treinosPorMes[mes] || 0) + 1;
            });

            historicos.forEach(historico => {
                const mes = historico.dataCorrida.toISOString().substring(0, 7); // YYYY-MM
                evolucaoTemporal.corridasPorMes[mes] = (evolucaoTemporal.corridasPorMes[mes] || 0) + 1;
                evolucaoTemporal.pontuacaoPorMes[mes] = (evolucaoTemporal.pontuacaoPorMes[mes] || 0) + historico.pontuacao;
            });

            const relatorio = {
                usuario: {
                    id: usuario._id,
                    nome: usuario.nome,
                    psnId: usuario.psnId,
                    nivel: usuario.nivel,
                    perfil: usuario.perfil,
                    plataforma: usuario.plataforma
                },
                periodo: {
                    inicio: periodoInicio ? formatarDataBrasileira(new Date(periodoInicio)) : 'Todas as datas',
                    fim: periodoFim ? formatarDataBrasileira(new Date(periodoFim)) : 'Todas as datas'
                },
                estatisticasTreino,
                estatisticasCorrida,
                evolucaoTemporal,
                resumo: {
                    totalAtividades: treinos.length + historicos.length,
                    taxaParticipacao: treinos.length > 0 ? 
                        (treinos.reduce((sum, t) => sum + (t.participacao ? 1 : 0), 0) / treinos.length * 100).toFixed(2) + '%' : '0%',
                    taxaDesistencia: treinos.length > 0 ? 
                        (treinos.reduce((sum, t) => sum + (t.desistencia ? 1 : 0), 0) / treinos.length * 100).toFixed(2) + '%' : '0%',
                    performanceGeral: historicos.length > 0 ? 
                        (estatisticasCorrida.pontuacaoMedia / 25 * 100).toFixed(2) + '%' : '0%' // Assumindo pontuação máxima de 25
                }
            };

            return res.status(200).json(new ApiResponse(true, 'Relatório de performance gerado com sucesso', relatorio));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao gerar relatório de performance', null, { error: err.message }));
        }
    },

    // Relatório Detalhado de Treinos
    async relatorioDetalhadoTreinos(req, res) {
        try {
            const { usuarioId } = req.params;
            const { simulador, pista, periodoInicio, periodoFim } = req.query;

            // Verificar se o usuário existe
            const usuario = await Usuario.findById(usuarioId);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            }

            // Construir filtros
            let filtros = { usuarioId };
            
            if (simulador) filtros.simulador = simulador;
            if (pista) filtros.pista = pista;
            
            if (periodoInicio && periodoFim) {
                filtros.dataTreino = {
                    $gte: new Date(periodoInicio),
                    $lte: new Date(periodoFim)
                };
            }

            const treinos = await Treino.find(filtros).sort({ dataTreino: -1 });

            // Análise por simulador
            const analisePorSimulador = {};
            treinos.forEach(treino => {
                if (!analisePorSimulador[treino.simulador]) {
                    analisePorSimulador[treino.simulador] = {
                                            totalTreinos: 0,
                    totalParticipacoes: 0,
                    totalVitorias: 0,
                    totalDesistencias: 0,
                        melhorVolta: null,
                        pistasUtilizadas: new Set()
                    };
                }
                
                analisePorSimulador[treino.simulador].totalTreinos++;
                analisePorSimulador[treino.simulador].totalParticipacoes += treino.participacao ? 1 : 0;
                analisePorSimulador[treino.simulador].totalVitorias += treino.vitoria ? 1 : 0;
                analisePorSimulador[treino.simulador].totalDesistencias += treino.desistencia ? 1 : 0;
                analisePorSimulador[treino.simulador].pistasUtilizadas.add(treino.pista);
            });

            // Converter Sets para Arrays
            Object.keys(analisePorSimulador).forEach(simulador => {
                analisePorSimulador[simulador].pistasUtilizadas = Array.from(analisePorSimulador[simulador].pistasUtilizadas);
                analisePorSimulador[simulador].taxaVitoria = analisePorSimulador[simulador].totalParticipacoes > 0 ? 
                    (analisePorSimulador[simulador].totalVitorias / analisePorSimulador[simulador].totalParticipacoes * 100).toFixed(2) + '%' : '0%';
                analisePorSimulador[simulador].taxaDesistencia = analisePorSimulador[simulador].totalTreinos > 0 ? 
                    (analisePorSimulador[simulador].totalDesistencias / analisePorSimulador[simulador].totalTreinos * 100).toFixed(2) + '%' : '0%';
            });

            // Análise por pista
            const analisePorPista = {};
            treinos.forEach(treino => {
                if (!analisePorPista[treino.pista]) {
                    analisePorPista[treino.pista] = {
                        totalTreinos: 0,
                        totalParticipacoes: 0,
                        totalVitorias: 0,
                        totalDesistencias: 0,
                        melhorVolta: null,
                        simuladoresUtilizados: new Set()
                    };
                }
                
                analisePorPista[treino.pista].totalTreinos++;
                analisePorPista[treino.pista].totalParticipacoes += treino.participacao ? 1 : 0;
                analisePorPista[treino.pista].totalVitorias += treino.vitoria ? 1 : 0;
                analisePorPista[treino.pista].totalDesistencias += treino.desistencia ? 1 : 0;
                analisePorPista[treino.pista].simuladoresUtilizados.add(treino.simulador);
                
                // Atualizar melhor volta se necessário
                if (!analisePorPista[treino.pista].melhorVolta || treino.melhorVolta < analisePorPista[treino.pista].melhorVolta) {
                    analisePorPista[treino.pista].melhorVolta = treino.melhorVolta;
                }
            });

            // Converter Sets para Arrays
            Object.keys(analisePorPista).forEach(pista => {
                analisePorPista[pista].simuladoresUtilizados = Array.from(analisePorPista[pista].simuladoresUtilizados);
                analisePorPista[pista].taxaVitoria = analisePorPista[pista].totalParticipacoes > 0 ? 
                    (analisePorPista[pista].totalVitorias / analisePorPista[pista].totalParticipacoes * 100).toFixed(2) + '%' : '0%';
                analisePorPista[pista].taxaDesistencia = analisePorPista[pista].totalTreinos > 0 ? 
                    (analisePorPista[pista].totalDesistencias / analisePorPista[pista].totalTreinos * 100).toFixed(2) + '%' : '0%';
            });

            // Análise de frequência por período
            const frequenciaPorPeriodo = {
                porMes: {},
                porSemana: {},
                porDiaSemana: {}
            };

            treinos.forEach(treino => {
                const data = new Date(treino.dataTreino);
                const mes = data.toISOString().substring(0, 7);
                const semana = `${data.getFullYear()}-W${Math.ceil((data.getDate() + new Date(data.getFullYear(), data.getMonth(), 1).getDay()) / 7)}`;
                const diaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][data.getDay()];

                frequenciaPorPeriodo.porMes[mes] = (frequenciaPorPeriodo.porMes[mes] || 0) + 1;
                frequenciaPorPeriodo.porSemana[semana] = (frequenciaPorPeriodo.porSemana[semana] || 0) + 1;
                frequenciaPorPeriodo.porDiaSemana[diaSemana] = (frequenciaPorPeriodo.porDiaSemana[diaSemana] || 0) + 1;
            });

            const relatorio = {
                usuario: {
                    id: usuario._id,
                    nome: usuario.nome,
                    psnId: usuario.psnId
                },
                filtros: {
                    simulador: simulador || 'Todos',
                    pista: pista || 'Todas',
                    periodo: periodoInicio && periodoFim ? 
                        `${formatarDataBrasileira(new Date(periodoInicio))} a ${formatarDataBrasileira(new Date(periodoFim))}` : 
                        'Todas as datas'
                },
                resumo: {
                    totalTreinos: treinos.length,
                    periodoAnalisado: treinos.length > 0 ? 
                        `${formatarDataBrasileira(treinos[treinos.length - 1].dataTreino)} a ${formatarDataBrasileira(treinos[0].dataTreino)}` : 
                        'Nenhum treino encontrado'
                },
                analisePorSimulador,
                analisePorPista,
                frequenciaPorPeriodo,
                treinos: treinos.map(treino => ({
                    id: treino._id,
                    campeonato: treino.campeonato,
                    pista: treino.pista,
                    simulador: treino.simulador,
                    melhorVolta: treino.melhorVolta,
                    participacao: treino.participacao,
                    vitoria: treino.vitoria,
                    falta: treino.falta,
                    desistencia: treino.desistencia,
                    dataTreino: formatarDataBrasileira(treino.dataTreino)
                }))
            };

            return res.status(200).json(new ApiResponse(true, 'Relatório detalhado de treinos gerado com sucesso', relatorio));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao gerar relatório detalhado de treinos', null, { error: err.message }));
        }
    },

    // Relatório Detalhado de Corridas
    async relatorioDetalhadoCorridas(req, res) {
        try {
            const { usuarioId } = req.params;
            const { liga, simulador, periodoInicio, periodoFim } = req.query;

            // Verificar se o usuário existe
            const usuario = await Usuario.findById(usuarioId);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            }

            // Construir filtros
            let filtros = { usuarioId };
            
            if (liga) filtros.liga = liga;
            if (simulador) filtros.simulador = simulador;
            
            if (periodoInicio && periodoFim) {
                filtros.dataCorrida = {
                    $gte: new Date(periodoInicio),
                    $lte: new Date(periodoFim)
                };
            }

            const historicos = await HistoricoCorrida.find(filtros).sort({ dataCorrida: -1 });

            // Análise por liga
            const analisePorLiga = {};
            historicos.forEach(historico => {
                if (!analisePorLiga[historico.liga]) {
                    analisePorLiga[historico.liga] = {
                        totalCorridas: 0,
                        totalPontuacao: 0,
                        vitorias: 0,
                        podios: 0,
                        melhorPosicao: Infinity,
                        piorPosicao: 0,
                        etapas: new Set(),
                        simuladoresUtilizados: new Set()
                    };
                }
                
                analisePorLiga[historico.liga].totalCorridas++;
                analisePorLiga[historico.liga].totalPontuacao += historico.pontuacao;
                analisePorLiga[historico.liga].etapas.add(historico.etapa);
                analisePorLiga[historico.liga].simuladoresUtilizados.add(historico.simulador);
                
                if (historico.posicaoChegada === 1) analisePorLiga[historico.liga].vitorias++;
                if (historico.posicaoChegada <= 3) analisePorLiga[historico.liga].podios++;
                
                if (historico.posicaoChegada < analisePorLiga[historico.liga].melhorPosicao) {
                    analisePorLiga[historico.liga].melhorPosicao = historico.posicaoChegada;
                }
                if (historico.posicaoChegada > analisePorLiga[historico.liga].piorPosicao) {
                    analisePorLiga[historico.liga].piorPosicao = historico.posicaoChegada;
                }
            });

            // Processar dados das ligas
            Object.keys(analisePorLiga).forEach(liga => {
                analisePorLiga[liga].etapas = Array.from(analisePorLiga[liga].etapas).sort((a, b) => a - b);
                analisePorLiga[liga].simuladoresUtilizados = Array.from(analisePorLiga[liga].simuladoresUtilizados);
                analisePorLiga[liga].pontuacaoMedia = (analisePorLiga[liga].totalPontuacao / analisePorLiga[liga].totalCorridas).toFixed(2);
                analisePorLiga[liga].taxaVitoria = (analisePorLiga[liga].vitorias / analisePorLiga[liga].totalCorridas * 100).toFixed(2) + '%';
                analisePorLiga[liga].taxaPodio = (analisePorLiga[liga].podios / analisePorLiga[liga].totalCorridas * 100).toFixed(2) + '%';
                analisePorLiga[liga].melhorPosicao = analisePorLiga[liga].melhorPosicao === Infinity ? 'N/A' : analisePorLiga[liga].melhorPosicao;
            });

            // Análise de evolução por etapa
            const evolucaoPorEtapa = {};
            historicos.forEach(historico => {
                const chave = `${historico.liga}-${historico.etapa}`;
                if (!evolucaoPorEtapa[chave]) {
                    evolucaoPorEtapa[chave] = {
                        liga: historico.liga,
                        etapa: historico.etapa,
                        pista: historico.pista,
                        posicaoLargada: historico.posicaoLargada,
                        posicaoChegada: historico.posicaoChegada,
                        pontuacao: historico.pontuacao,
                        vmr: historico.vmr,
                        dataCorrida: formatarDataBrasileira(historico.dataCorrida),
                        evolucao: historico.posicaoChegada - historico.posicaoLargada
                    };
                }
            });

            // Análise de performance por simulador
            const analisePorSimulador = {};
            historicos.forEach(historico => {
                if (!analisePorSimulador[historico.simulador]) {
                    analisePorSimulador[historico.simulador] = {
                        totalCorridas: 0,
                        totalPontuacao: 0,
                        vitorias: 0,
                        podios: 0,
                        ligasParticipadas: new Set()
                    };
                }
                
                analisePorSimulador[historico.simulador].totalCorridas++;
                analisePorSimulador[historico.simulador].totalPontuacao += historico.pontuacao;
                analisePorSimulador[historico.simulador].ligasParticipadas.add(historico.liga);
                
                if (historico.posicaoChegada === 1) analisePorSimulador[historico.simulador].vitorias++;
                if (historico.posicaoChegada <= 3) analisePorSimulador[historico.simulador].podios++;
            });

            // Processar dados dos simuladores
            Object.keys(analisePorSimulador).forEach(simulador => {
                analisePorSimulador[simulador].ligasParticipadas = Array.from(analisePorSimulador[simulador].ligasParticipadas);
                analisePorSimulador[simulador].pontuacaoMedia = (analisePorSimulador[simulador].totalPontuacao / analisePorSimulador[simulador].totalCorridas).toFixed(2);
                analisePorSimulador[simulador].taxaVitoria = (analisePorSimulador[simulador].vitorias / analisePorSimulador[simulador].totalCorridas * 100).toFixed(2) + '%';
                analisePorSimulador[simulador].taxaPodio = (analisePorSimulador[simulador].podios / analisePorSimulador[simulador].totalCorridas * 100).toFixed(2) + '%';
            });

            const relatorio = {
                usuario: {
                    id: usuario._id,
                    nome: usuario.nome,
                    psnId: usuario.psnId
                },
                filtros: {
                    liga: liga || 'Todas',
                    simulador: simulador || 'Todos',
                    periodo: periodoInicio && periodoFim ? 
                        `${formatarDataBrasileira(new Date(periodoInicio))} a ${formatarDataBrasileira(new Date(periodoFim))}` : 
                        'Todas as datas'
                },
                resumo: {
                    totalCorridas: historicos.length,
                    pontuacaoTotal: historicos.reduce((sum, h) => sum + h.pontuacao, 0),
                    pontuacaoMedia: historicos.length > 0 ? 
                        (historicos.reduce((sum, h) => sum + h.pontuacao, 0) / historicos.length).toFixed(2) : 0,
                    vitorias: historicos.filter(h => h.posicaoChegada === 1).length,
                    podios: historicos.filter(h => h.posicaoChegada <= 3).length,
                    vmrCount: historicos.filter(h => h.vmr).length
                },
                analisePorLiga,
                analisePorSimulador,
                evolucaoPorEtapa,
                corridas: historicos.map(historico => ({
                    id: historico._id,
                    liga: historico.liga,
                    etapa: historico.etapa,
                    pista: historico.pista,
                    simulador: historico.simulador,
                    posicaoLargada: historico.posicaoLargada,
                    posicaoChegada: historico.posicaoChegada,
                    pontuacao: historico.pontuacao,
                    vmr: historico.vmr,
                    evolucao: historico.posicaoChegada - historico.posicaoLargada,
                    dataCorrida: formatarDataBrasileira(historico.dataCorrida),
                    linkTransmissao: historico.linkTransmissao
                }))
            };

            return res.status(200).json(new ApiResponse(true, 'Relatório detalhado de corridas gerado com sucesso', relatorio));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao gerar relatório detalhado de corridas', null, { error: err.message }));
        }
    },

    // Relatório Comparativo entre Usuários
    async relatorioComparativo(req, res) {
        try {
            const { usuarioIds } = req.query; // Array de IDs separados por vírgula
            const { periodoInicio, periodoFim } = req.query;

            if (!usuarioIds) {
                return res.status(400).json(new ApiResponse(false, 'IDs dos usuários são obrigatórios'));
            }

            const ids = usuarioIds.split(',');
            
            // Verificar se todos os usuários existem
            const usuarios = await Usuario.find({ _id: { $in: ids } });
            if (usuarios.length !== ids.length) {
                return res.status(404).json(new ApiResponse(false, 'Um ou mais usuários não encontrados'));
            }

            // Construir filtros de data
            let filtroData = {};
            if (periodoInicio && periodoFim) {
                filtroData = {
                    $gte: new Date(periodoInicio),
                    $lte: new Date(periodoFim)
                };
            }

            const comparativo = [];

            for (const usuario of usuarios) {
                // Buscar dados de treino
                const treinos = await Treino.find({ 
                    usuarioId: usuario._id, 
                    dataTreino: filtroData 
                });

                // Buscar dados de corrida
                const historicos = await HistoricoCorrida.find({ 
                    usuarioId: usuario._id, 
                    dataCorrida: filtroData 
                });

                // Calcular estatísticas
                const estatisticasTreino = {
                    totalTreinos: treinos.length,
                    totalParticipacoes: treinos.reduce((sum, t) => sum + t.participacao, 0),
                    totalVitorias: treinos.reduce((sum, t) => sum + t.vitoria, 0),
                    totalFaltas: treinos.reduce((sum, t) => sum + t.falta, 0),
                    totalDesistencias: treinos.reduce((sum, t) => sum + (t.desistencia ? 1 : 0), 0),
                    taxaVitoria: treinos.length > 0 ? 
                        (treinos.reduce((sum, t) => sum + t.vitoria, 0) / treinos.reduce((sum, t) => sum + t.participacao, 0) * 100).toFixed(2) + '%' : '0%',
                    taxaDesistencia: treinos.length > 0 ? 
                        (treinos.reduce((sum, t) => sum + (t.desistencia ? 1 : 0), 0) / treinos.length * 100).toFixed(2) + '%' : '0%'
                };

                const estatisticasCorrida = {
                    totalCorridas: historicos.length,
                    totalPontuacao: historicos.reduce((sum, h) => sum + h.pontuacao, 0),
                    pontuacaoMedia: historicos.length > 0 ? 
                        (historicos.reduce((sum, h) => sum + h.pontuacao, 0) / historicos.length).toFixed(2) : 0,
                    vitorias: historicos.filter(h => h.posicaoChegada === 1).length,
                    podios: historicos.filter(h => h.posicaoChegada <= 3).length,
                    vmrCount: historicos.filter(h => h.vmr).length
                };

                comparativo.push({
                    usuario: {
                        id: usuario._id,
                        nome: usuario.nome,
                        psnId: usuario.psnId,
                        nivel: usuario.nivel,
                        perfil: usuario.perfil
                    },
                    estatisticasTreino,
                    estatisticasCorrida,
                    performanceGeral: {
                        totalAtividades: treinos.length + historicos.length,
                        taxaParticipacao: treinos.length > 0 ? 
                            ((treinos.reduce((sum, t) => sum + t.participacao, 0) - treinos.reduce((sum, t) => sum + t.falta, 0)) / treinos.reduce((sum, t) => sum + t.participacao, 0) * 100).toFixed(2) + '%' : '0%',
                        taxaDesistencia: treinos.length > 0 ? 
                            (treinos.reduce((sum, t) => sum + (t.desistencia ? 1 : 0), 0) / treinos.length * 100).toFixed(2) + '%' : '0%',
                        scoreGeral: historicos.length > 0 ? 
                            (estatisticasCorrida.pontuacaoMedia / 25 * 100).toFixed(2) : 0 // Assumindo pontuação máxima de 25
                    }
                });
            }

            // Ordenar por score geral
            comparativo.sort((a, b) => parseFloat(b.performanceGeral.scoreGeral) - parseFloat(a.performanceGeral.scoreGeral));

            const relatorio = {
                periodo: {
                    inicio: periodoInicio ? formatarDataBrasileira(new Date(periodoInicio)) : 'Todas as datas',
                    fim: periodoFim ? formatarDataBrasileira(new Date(periodoFim)) : 'Todas as datas'
                },
                comparativo,
                ranking: comparativo.map((item, index) => ({
                    posicao: index + 1,
                    usuario: item.usuario.nome,
                    psnId: item.usuario.psnId,
                    scoreGeral: item.performanceGeral.scoreGeral,
                    totalAtividades: item.performanceGeral.totalAtividades
                }))
            };

            return res.status(200).json(new ApiResponse(true, 'Relatório comparativo gerado com sucesso', relatorio));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao gerar relatório comparativo', null, { error: err.message }));
        }
    },

    // Relatório Geral da Equipe (Todos os Pilotos)
    async relatorioGeralEquipe(req, res) {
        try {
            const { periodoInicio, periodoFim, nivel, perfil, ativo } = req.query;

            // Construir filtros de data
            let filtroData = {};
            if (periodoInicio && periodoFim) {
                filtroData = {
                    $gte: new Date(periodoInicio),
                    $lte: new Date(periodoFim)
                };
            }

            // Construir filtros para usuários
            let filtrosUsuario = {};
            if (nivel) filtrosUsuario.nivel = nivel;
            if (perfil) filtrosUsuario.perfil = perfil;
            if (ativo !== undefined) filtrosUsuario.ativo = ativo === 'true';

            // Buscar todos os usuários ativos
            const usuarios = await Usuario.find(filtrosUsuario);
            
            if (usuarios.length === 0) {
                return res.status(404).json(new ApiResponse(false, 'Nenhum usuário encontrado com os filtros aplicados'));
            }

            // Estatísticas gerais da equipe
            let estatisticasGerais = {
                totalPilotos: usuarios.length,
                totalTreinos: 0,
                totalCorridas: 0,
                totalParticipacoes: 0,
                totalVitorias: 0,
                totalPontuacao: 0,
                totalFaltas: 0,
                totalVmr: 0,
                simuladoresUtilizados: new Set(),
                pistasUtilizadas: new Set(),
                ligasParticipadas: new Set()
            };

            // Dados individuais de cada piloto
            const dadosPilotos = [];

            for (const usuario of usuarios) {
                // Buscar dados de treino
                const treinos = await Treino.find({ 
                    usuarioId: usuario._id, 
                    dataTreino: filtroData 
                });

                // Buscar dados de corrida
                const historicos = await HistoricoCorrida.find({ 
                    usuarioId: usuario._id, 
                    dataCorrida: filtroData 
                });

                // Calcular estatísticas do piloto
                const estatisticasTreino = {
                    totalTreinos: treinos.length,
                    totalParticipacoes: treinos.reduce((sum, t) => sum + t.participacao, 0),
                    totalVitorias: treinos.reduce((sum, t) => sum + t.vitoria, 0),
                    totalFaltas: treinos.reduce((sum, t) => sum + t.falta, 0),
                    totalDesistencias: treinos.reduce((sum, t) => sum + (t.desistencia ? 1 : 0), 0),
                    taxaVitoria: treinos.length > 0 ? 
                        (treinos.reduce((sum, t) => sum + t.vitoria, 0) / treinos.reduce((sum, t) => sum + t.participacao, 0) * 100).toFixed(2) + '%' : '0%',
                    taxaDesistencia: treinos.length > 0 ? 
                        (treinos.reduce((sum, t) => sum + (t.desistencia ? 1 : 0), 0) / treinos.length * 100).toFixed(2) + '%' : '0%'
                };

                const estatisticasCorrida = {
                    totalCorridas: historicos.length,
                    totalPontuacao: historicos.reduce((sum, h) => sum + h.pontuacao, 0),
                    pontuacaoMedia: historicos.length > 0 ? 
                        (historicos.reduce((sum, h) => sum + h.pontuacao, 0) / historicos.length).toFixed(2) : 0,
                    vitorias: historicos.filter(h => h.posicaoChegada === 1).length,
                    podios: historicos.filter(h => h.posicaoChegada <= 3).length,
                    vmrCount: historicos.filter(h => h.vmr).length
                };

                // Adicionar dados às estatísticas gerais
                estatisticasGerais.totalTreinos += treinos.length;
                estatisticasGerais.totalCorridas += historicos.length;
                estatisticasGerais.totalParticipacoes += estatisticasTreino.totalParticipacoes;
                estatisticasGerais.totalVitorias += estatisticasTreino.totalVitorias;
                estatisticasGerais.totalPontuacao += estatisticasCorrida.totalPontuacao;
                estatisticasGerais.totalFaltas += estatisticasTreino.totalFaltas;
                estatisticasGerais.totalVmr += estatisticasCorrida.vmrCount;

                // Adicionar simuladores, pistas e ligas
                treinos.forEach(t => {
                    estatisticasGerais.simuladoresUtilizados.add(t.simulador);
                    estatisticasGerais.pistasUtilizadas.add(t.pista);
                });

                historicos.forEach(h => {
                    estatisticasGerais.simuladoresUtilizados.add(h.simulador);
                    estatisticasGerais.ligasParticipadas.add(h.liga);
                });

                dadosPilotos.push({
                    usuario: {
                        id: usuario._id,
                        nome: usuario.nome,
                        psnId: usuario.psnId,
                        nivel: usuario.nivel,
                        perfil: usuario.perfil,
                        plataforma: usuario.plataforma,
                        ativo: usuario.ativo
                    },
                    estatisticasTreino,
                    estatisticasCorrida,
                    performanceGeral: {
                        totalAtividades: treinos.length + historicos.length,
                        taxaParticipacao: treinos.length > 0 ? 
                            (treinos.reduce((sum, t) => sum + (t.participacao ? 1 : 0), 0) / treinos.length * 100).toFixed(2) + '%' : '0%',
                        taxaDesistencia: treinos.length > 0 ? 
                            (treinos.reduce((sum, t) => sum + (t.desistencia ? 1 : 0), 0) / treinos.length * 100).toFixed(2) + '%' : '0%',
                        scoreGeral: historicos.length > 0 ? 
                            (estatisticasCorrida.pontuacaoMedia / 25 * 100).toFixed(2) : 0
                    }
                });
            }

            // Calcular médias e totais gerais
            estatisticasGerais.simuladoresUtilizados = Array.from(estatisticasGerais.simuladoresUtilizados);
            estatisticasGerais.pistasUtilizadas = Array.from(estatisticasGerais.pistasUtilizadas);
            estatisticasGerais.ligasParticipadas = Array.from(estatisticasGerais.ligasParticipadas);
            
            estatisticasGerais.pontuacaoMediaEquipe = estatisticasGerais.totalCorridas > 0 ? 
                (estatisticasGerais.totalPontuacao / estatisticasGerais.totalCorridas).toFixed(2) : 0;
            
            estatisticasGerais.taxaVitoriaEquipe = estatisticasGerais.totalParticipacoes > 0 ? 
                (estatisticasGerais.totalVitorias / estatisticasGerais.totalParticipacoes * 100).toFixed(2) + '%' : '0%';

            // Ordenar pilotos por performance
            dadosPilotos.sort((a, b) => parseFloat(b.performanceGeral.scoreGeral) - parseFloat(a.performanceGeral.scoreGeral));

            // Análise por nível
            const analisePorNivel = {};
            dadosPilotos.forEach(piloto => {
                const nivel = piloto.usuario.nivel;
                if (!analisePorNivel[nivel]) {
                    analisePorNivel[nivel] = {
                        totalPilotos: 0,
                        totalTreinos: 0,
                        totalCorridas: 0,
                        pontuacaoMedia: 0,
                        taxaVitoria: 0
                    };
                }
                analisePorNivel[nivel].totalPilotos++;
                analisePorNivel[nivel].totalTreinos += piloto.estatisticasTreino.totalTreinos;
                analisePorNivel[nivel].totalCorridas += piloto.estatisticasCorrida.totalCorridas;
            });

            // Calcular médias por nível
            Object.keys(analisePorNivel).forEach(nivel => {
                const dados = analisePorNivel[nivel];
                dados.pontuacaoMedia = dados.totalCorridas > 0 ? 
                    (dadosPilotos.filter(p => p.usuario.nivel === nivel)
                        .reduce((sum, p) => sum + parseFloat(p.estatisticasCorrida.pontuacaoMedia), 0) / dados.totalPilotos).toFixed(2) : 0;
            });

            const relatorio = {
                periodo: {
                    inicio: periodoInicio ? formatarDataBrasileira(new Date(periodoInicio)) : 'Todas as datas',
                    fim: periodoFim ? formatarDataBrasileira(new Date(periodoFim)) : 'Todas as datas'
                },
                filtros: {
                    nivel: nivel || 'Todos',
                    perfil: perfil || 'Todos',
                    ativo: ativo !== undefined ? (ativo === 'true' ? 'Ativos' : 'Inativos') : 'Todos'
                },
                estatisticasGerais,
                analisePorNivel,
                rankingPilotos: dadosPilotos.map((piloto, index) => ({
                    posicao: index + 1,
                    nome: piloto.usuario.nome,
                    psnId: piloto.usuario.psnId,
                    nivel: piloto.usuario.nivel,
                    scoreGeral: piloto.performanceGeral.scoreGeral,
                    totalAtividades: piloto.performanceGeral.totalAtividades,
                    pontuacaoMedia: piloto.estatisticasCorrida.pontuacaoMedia
                })),
                pilotos: dadosPilotos
            };

            return res.status(200).json(new ApiResponse(true, 'Relatório geral da equipe gerado com sucesso', relatorio));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao gerar relatório geral da equipe', null, { error: err.message }));
        }
    },

    // Relatório Detalhado de Faltas
    async relatorioDetalhadoFaltas(req, res) {
        try {
            const { usuarioId } = req.params;
            const { tipoFalta, tipo, periodoInicio, periodoFim } = req.query;

            // Verificar se o usuário existe
            const usuario = await Usuario.findById(usuarioId);
            if (!usuario) {
                return res.status(404).json(new ApiResponse(false, 'Usuário não encontrado'));
            }

            // Construir filtros
            let filtros = { usuarioId };
            
            if (tipoFalta) filtros.tipoFalta = tipoFalta;
            if (tipo) filtros.tipo = tipo;
            
            if (periodoInicio && periodoFim) {
                filtros.dataCadastro = {
                    $gte: new Date(periodoInicio),
                    $lte: new Date(periodoFim)
                };
            }

            const faltas = await Falta.find(filtros)
                .populate('usuarioRegistroId', 'nome')
                .populate('usuarioEdicaoId', 'nome')
                .sort({ dataCadastro: -1 });

            // Estatísticas gerais
            const estatisticasGerais = {
                totalFaltas: faltas.length,
                totalJustificadas: faltas.filter(f => f.tipo === 'JUSTIFICADA').length,
                totalNaoJustificadas: faltas.filter(f => f.tipo === 'NAO_JUSTIFICADA').length,
                taxaJustificadas: faltas.length > 0 ? 
                    (faltas.filter(f => f.tipo === 'JUSTIFICADA').length / faltas.length * 100).toFixed(2) + '%' : '0%',
                tiposFalta: [...new Set(faltas.map(f => f.tipoFalta))]
            };

            // Análise por tipo de falta
            const analisePorTipoFalta = {};
            faltas.forEach(falta => {
                if (!analisePorTipoFalta[falta.tipoFalta]) {
                    analisePorTipoFalta[falta.tipoFalta] = {
                        total: 0,
                        justificadas: 0,
                        naoJustificadas: 0,
                        taxaJustificadas: '0%'
                    };
                }
                
                analisePorTipoFalta[falta.tipoFalta].total++;
                if (falta.tipo === 'JUSTIFICADA') {
                    analisePorTipoFalta[falta.tipoFalta].justificadas++;
                } else {
                    analisePorTipoFalta[falta.tipoFalta].naoJustificadas++;
                }
            });

            // Calcular taxas por tipo
            Object.keys(analisePorTipoFalta).forEach(tipo => {
                const dados = analisePorTipoFalta[tipo];
                dados.taxaJustificadas = dados.total > 0 ? 
                    (dados.justificadas / dados.total * 100).toFixed(2) + '%' : '0%';
            });

            // Análise por período
            const analisePorPeriodo = {
                porMes: {},
                porSemana: {},
                porDiaSemana: {}
            };

            faltas.forEach(falta => {
                const data = new Date(falta.dataCadastro);
                const mes = data.toISOString().substring(0, 7);
                const semana = `${data.getFullYear()}-W${Math.ceil((data.getDate() + new Date(data.getFullYear(), data.getMonth(), 1).getDay()) / 7)}`;
                const diaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][data.getDay()];

                analisePorPeriodo.porMes[mes] = (analisePorPeriodo.porMes[mes] || 0) + 1;
                analisePorPeriodo.porSemana[semana] = (analisePorPeriodo.porSemana[semana] || 0) + 1;
                analisePorPeriodo.porDiaSemana[diaSemana] = (analisePorPeriodo.porDiaSemana[diaSemana] || 0) + 1;
            });

            // Análise de justificativas
            const justificativasComuns = {};
            faltas.filter(f => f.tipo === 'JUSTIFICADA' && f.justificativa).forEach(falta => {
                const justificativa = falta.justificativa.toLowerCase().trim();
                justificativasComuns[justificativa] = (justificativasComuns[justificativa] || 0) + 1;
            });

            // Ordenar justificativas por frequência
            const justificativasOrdenadas = Object.entries(justificativasComuns)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10) // Top 10
                .map(([justificativa, count]) => ({ justificativa, count }));

            // Detalhamento das faltas
            const detalhamentoFaltas = faltas.map(falta => ({
                id: falta._id,
                tipoFalta: falta.tipoFalta,
                tipo: falta.tipo,
                justificativa: falta.justificativa,
                dataCadastro: formatarDataBrasileira(falta.dataCadastro),
                dataAlteracao: formatarDataBrasileira(falta.dataAlteracao),
                usuarioRegistro: falta.usuarioRegistroId?.nome || 'N/A',
                usuarioEdicao: falta.usuarioEdicaoId?.nome || 'N/A'
            }));

            const relatorio = {
                usuario: {
                    id: usuario._id,
                    nome: usuario.nome,
                    psnId: usuario.psnId,
                    nivel: usuario.nivel,
                    perfil: usuario.perfil
                },
                periodo: {
                    inicio: periodoInicio ? formatarDataBrasileira(new Date(periodoInicio)) : 'Todas as datas',
                    fim: periodoFim ? formatarDataBrasileira(new Date(periodoFim)) : 'Todas as datas'
                },
                filtros: {
                    tipoFalta: tipoFalta || 'Todos',
                    tipo: tipo || 'Todos'
                },
                estatisticasGerais,
                analisePorTipoFalta,
                analisePorPeriodo,
                justificativasComuns: justificativasOrdenadas,
                detalhamentoFaltas,
                resumo: {
                    totalFaltas: faltas.length,
                    taxaJustificadas: estatisticasGerais.taxaJustificadas,
                    tipoMaisFrequente: Object.keys(analisePorTipoFalta).length > 0 ? 
                        Object.entries(analisePorTipoFalta)
                            .sort(([,a], [,b]) => b.total - a.total)[0][0] : 'N/A',
                    mesComMaisFaltas: Object.keys(analisePorPeriodo.porMes).length > 0 ? 
                        Object.entries(analisePorPeriodo.porMes)
                            .sort(([,a], [,b]) => b - a)[0][0] : 'N/A'
                }
            };

            return res.status(200).json(new ApiResponse(true, 'Relatório de faltas gerado com sucesso', relatorio));
        } catch (err) {
            return res.status(500).json(new ApiResponse(false, 'Erro ao gerar relatório de faltas', null, { error: err.message }));
        }
    }
};

module.exports = RelatorioController; 