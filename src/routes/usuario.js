const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const UsuarioController = require('../controllers/UsuarioController');

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cria um novo usuário (registro público)
 *     tags: [Usuário]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - dataNascimento
 *               - telefone
 *               - email
 *               - senha
 *               - psnId
 *               - volante
 *               - nivel
 *               - perfil
 *               - plataforma
 *             properties:
 *               nome:
 *                 type: string
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *               telefone:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               psnId:
 *                 type: string
 *               fotoPerfil:
 *                 type: string
 *                 nullable: true
 *               volante:
 *                 type: string
 *               nivel:
 *                 type: string
 *               perfil:
 *                 type: string
 *               plataforma:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 */
router.post('/', UsuarioController.create);
router.get('/', UsuarioController.getAll);

/**
 * @swagger
 * /usuarios/{id}/toggle-ativo:
 *   patch:
 *     summary: Altera o status ativo/inativo do usuário
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ativo
 *             properties:
 *               ativo:
 *                 type: boolean
 *                 description: Status ativo (true) ou inativo (false)
 *     responses:
 *       200:
 *         description: Status do usuário alterado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Usuário não encontrado
 */
router.patch('/:id/toggle-ativo', UsuarioController.toggleAtivo);

/**
 * @swagger
 * /usuarios/{id}/alterar-senha:
 *   patch:
 *     summary: Altera a senha do usuário
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senhaAtual
 *               - novaSenha
 *             properties:
 *               senhaAtual:
 *                 type: string
 *                 description: Senha atual do usuário
 *               novaSenha:
 *                 type: string
 *                 minLength: 6
 *                 description: Nova senha (mínimo 6 caracteres)
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos ou senha atual incorreta
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Usuário não encontrado
 */
router.patch('/:id/alterar-senha', UsuarioController.alterarSenha);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Usuário não encontrado
 *   put:
 *     summary: Atualiza um usuário pelo ID
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *               telefone:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               psnId:
 *                 type: string
 *               fotoPerfil:
 *                 type: string
 *               fotoCard:
 *                 type: string
 *               volante:
 *                 type: string
 *               nivel:
 *                 type: string
 *               perfil:
 *                 type: string
 *               plataforma:
 *                 type: string
 *               simulador:
 *                 type: array
 *                 items:
 *                   type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Usuário não encontrado
 *   delete:
 *     summary: Remove um usuário pelo ID
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *       401:
 *         description: Token de autenticação inválido ou não fornecido
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', UsuarioController.getById);
router.put('/:id', UsuarioController.update);
router.delete('/:id', UsuarioController.delete);

/**
 * @swagger
 * /usuarios/upload-perfil:
 *   post:
 *     summary: Faz upload da imagem de perfil do usuário
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagem:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem do perfil
 *     responses:
 *       200:
 *         description: Imagem de perfil enviada com sucesso
 *       400:
 *         description: Erro no upload da imagem
 */
// Upload de imagem de perfil
router.post('/upload-perfil', upload.single('imagem'), UsuarioController.uploadPerfil);

/**
 * @swagger
 * /usuarios/upload-card:
 *   post:
 *     summary: Faz upload da imagem de card do usuário
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagem:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem do card
 *     responses:
 *       200:
 *         description: Imagem de card enviada com sucesso
 *       400:
 *         description: Erro no upload da imagem
 */
// Upload de imagem de card
router.post('/upload-card', upload.single('imagem'), UsuarioController.uploadCard);

module.exports = router; 