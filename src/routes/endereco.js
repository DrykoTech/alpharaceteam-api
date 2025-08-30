const express = require('express');
const router = express.Router();

const EnderecoController = require('../controllers/EnderecoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Endereco:
 *       type: object
 *       required:
 *         - usuarioId
 *         - rua
 *         - numero
 *         - bairro
 *         - cidade
 *         - estado
 *         - cep
 *         - pais
 *       properties:
 *         usuarioId:
 *           type: string
 *           description: ID do usuário
 *         rua:
 *           type: string
 *         numero:
 *           type: integer
 *         bairro:
 *           type: string
 *         cidade:
 *           type: string
 *         estado:
 *           type: string
 *         cep:
 *           type: string
 *         pais:
 *           type: string
 *       example:
 *         usuarioId: "665f1b2c2c8b2c001f7e4a1a"
 *         rua: "Rua das Flores"
 *         numero: 123
 *         bairro: "Centro"
 *         cidade: "São Paulo"
 *         estado: "SP"
 *         cep: "12345678"
 *         pais: "Brasil"
 */

/**
 * @swagger
 * /enderecos:
 *   get:
 *     summary: Lista todos os endereços com paginação e filtros
 *     description: Retorna uma lista paginada de endereços com opções de filtro
 *     tags: [Endereco]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Quantidade de registros por página (máximo 100)
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do usuário
 *       - in: query
 *         name: cidade
 *         schema:
 *           type: string
 *         description: Filtrar por cidade (busca case-insensitive)
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtrar por estado (busca case-insensitive)
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: Filtrar por nome do usuário (busca case-insensitive)
 *       - in: query
 *         name: psnId
 *         schema:
 *           type: string
 *         description: Filtrar por PSN ID do usuário (busca case-insensitive)
 *     responses:
 *       200:
 *         description: Lista de endereços retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     enderecos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           usuarioId:
 *                             type: string
 *                           rua:
 *                             type: string
 *                           numero:
 *                             type: string
 *                           bairro:
 *                             type: string
 *                           cidade:
 *                             type: string
 *                           estado:
 *                             type: string
 *                           cep:
 *                             type: string
 *                           pais:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *                         nextPage:
 *                           type: integer
 *                           nullable: true
 *                         prevPage:
 *                           type: integer
 *                           nullable: true
 *       400:
 *         description: Parâmetros de paginação inválidos
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', EnderecoController.create);
router.get('/', EnderecoController.getAll);

/**
 * @swagger
 * /enderecos/usuario/{usuarioId}:
 *   get:
 *     summary: Busca endereços por usuarioId
 *     tags: [Endereco]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Endereço(s) encontrado(s)
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Endereço não encontrado para este usuário
 */
router.get('/usuario/:usuarioId', EnderecoController.getByUsuario);

/**
 * @swagger
 * /enderecos/{id}:
 *   get:
 *     summary: Busca um endereço por ID
 *     tags: [Endereco]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Endereço encontrado
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *   put:
 *     summary: Atualiza um endereço por ID
 *     tags: [Endereco]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Endereco'
 *     responses:
 *       200:
 *         description: Endereço atualizado
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *   delete:
 *     summary: Deleta um endereço por ID
 *     tags: [Endereco]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Endereço deletado
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.get('/:id', EnderecoController.getById);
router.put('/:id', EnderecoController.update);
router.delete('/:id', EnderecoController.delete);

module.exports = router; 