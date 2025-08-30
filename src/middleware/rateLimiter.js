const rateLimit = require('express-rate-limit');
const ApiResponse = require('../models/ApiResponse');

/**
 * Rate Limiter para usuários autenticados (por token JWT)
 */
const userRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // 1000 requisições por usuário autenticado
    keyGenerator: (req) => {
        // Usa o ID do usuário do token JWT se disponível
        return req.usuario ? req.usuario.id : req.ip;
    },
    message: {
        error: true,
        message: 'Limite de requisições excedido para este usuário. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil(15 * 60 / 60) // minutos
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json(new ApiResponse(false, 'Limite de requisições excedido para este usuário. Tente novamente em alguns minutos.'));
    }
});

/**
 * Rate Limiter para rotas públicas (por IP)
 */
const publicRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 300, // 300 requisições por IP para rotas públicas
    keyGenerator: (req) => req.ip,
    message: {
        error: true,
        message: 'Limite de requisições excedido. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil(15 * 60 / 60) // minutos
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json(new ApiResponse(false, 'Limite de requisições excedido. Tente novamente em alguns minutos.'));
    }
});

/**
 * Rate Limiter específico para autenticação (mais restritivo)
 */
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 tentativas de login por IP
    keyGenerator: (req) => req.ip,
    message: {
        error: true,
        message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil(15 * 60 / 60) // minutos
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json(new ApiResponse(false, 'Muitas tentativas de login. Tente novamente em alguns minutos.'));
    }
});

/**
 * Rate Limiter para operações pesadas (relatórios, etc.)
 */
const heavyOperationRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 20, // 20 operações pesadas por usuário
    keyGenerator: (req) => {
        return req.usuario ? req.usuario.id : req.ip;
    },
    message: {
        error: true,
        message: 'Limite de operações pesadas excedido. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil(5 * 60 / 60) // minutos
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json(new ApiResponse(false, 'Limite de operações pesadas excedido. Tente novamente em alguns minutos.'));
    }
});

/**
 * Rate Limiter para envio de e-mails
 */
const emailRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 solicitações de e-mail por usuário por hora
    keyGenerator: (req) => {
        return req.usuario ? req.usuario.id : req.ip;
    },
    message: {
        error: true,
        message: 'Limite de solicitações de e-mail excedido. Tente novamente em uma hora.',
        retryAfter: Math.ceil(60 * 60 / 60) // minutos
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json(new ApiResponse(false, 'Limite de solicitações de e-mail excedido. Tente novamente em uma hora.'));
    }
});

module.exports = {
    userRateLimiter,
    publicRateLimiter,
    authRateLimiter,
    heavyOperationRateLimiter,
    emailRateLimiter
}; 