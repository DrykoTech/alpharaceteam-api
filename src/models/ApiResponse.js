class ApiResponse {
    /**
     * @param {boolean} success - Indica se a resposta é de sucesso
     * @param {string} message - Mensagem descritiva
     * @param {object} [data] - Dados retornados (opcional)
     * @param {object} [error] - Detalhes do erro (opcional)
     */
    constructor(success, message, data = null, error = null) {
        this.success = success;
        this.message = message;
        if (data !== null) this.data = data;
        if (error !== null) this.error = error;
    }
}

module.exports = ApiResponse; 