// Função para formatar data no formato brasileiro
const formatarDataBrasileira = (data) => {
    if (!data) return null;
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// Função para obter a data atual
const obterDataAtual = () => {
    const brasiliaDate = new Date();
    brasiliaDate.setHours(brasiliaDate.getHours() - 3);

    return brasiliaDate;
};

module.exports = {
    formatarDataBrasileira,
    obterDataAtual
}; 