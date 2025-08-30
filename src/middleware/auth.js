const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const ApiResponse = require('../models/ApiResponse');

const SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
    try {
        // Rotas públicas que não precisam de autenticação
        const publicRoutes = [
            { path: '/usuarios', method: 'POST' } // Permite criação de usuário (registro)
        ];

        // Verifica se a rota atual é pública
        const isPublicRoute = publicRoutes.some(route => 
            req.path === route.path && req.method === route.method
        );

        if (isPublicRoute) {
            return next();
        }

        // Verifica se o token foi enviado no header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json(new ApiResponse(false, 'Token de autenticação não fornecido'));
        }

        // Verifica se o header está no formato correto: "Bearer <token>"
        const parts = authHeader.split(' ');
        
        if (parts.length !== 2) {
            return res.status(401).json(new ApiResponse(false, 'Formato de token inválido'));
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json(new ApiResponse(false, 'Formato de token inválido'));
        }

        // Verifica e decodifica o token
        const decoded = jwt.verify(token, SECRET);
        
        // Busca o usuário no banco de dados
        const usuario = await Usuario.findById(decoded.id);
        
        if (!usuario) {
            return res.status(401).json(new ApiResponse(false, 'Usuário não encontrado'));
        }

        // Adiciona as informações do usuário ao objeto request
        req.usuario = {
            id: usuario._id,
            email: usuario.email,
            nome: usuario.nome,
            perfil: usuario.perfil
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json(new ApiResponse(false, 'Token inválido'));
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json(new ApiResponse(false, 'Token expirado'));
        }

        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json(new ApiResponse(false, 'Erro interno na autenticação'));
    }
};

module.exports = authMiddleware; 