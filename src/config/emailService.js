const emailQueueService = require('../services/EmailQueueService');
const logger = require('../utils/logger');

/**
 * Adiciona e-mail de cadastro à fila
 */
async function enviarEmailCadastro({ nome, email, senha }) {
  try {
    const conteudo = `
      <div style="font-family: sans-serif;">
        <h2>Olá ${nome}!</h2>
        <p>Você foi cadastrado no sistema da Alpha Race Team.</p>
        <p>Sua senha temporária é:</p>
        <p style="font-size: 20px; font-weight: bold; background-color: #f0f0f0; padding: 10px; border-radius: 5px; display: inline-block;">
          ${senha}
        </p>
        <p>Use esta senha para acessar o sistema e altere-a em sua conta.</p>
        <p><a href="https://art-admin-panel-three.vercel.app" target="_blank">Acessar o sistema</a></p>
        <br>
        <p>Boas corridas! 🏁</p>
        <p>Equipe Alpha Race Team</p>
      </div>
    `;

    await emailQueueService.adicionarEmail({
      destinatario: email,
      assunto: 'Bem-vindo à Alpha Race Team!',
      conteudo,
      templateId: 'cadastro',
      metadata: { nome, tipo: 'cadastro' },
      prioridade: 5
    });

    logger.info(`E-mail de cadastro adicionado à fila para: ${email}`);
  } catch (error) {
    logger.error('Erro ao adicionar e-mail de cadastro à fila:', error);
    throw error;
  }
}

/**
 * Adiciona e-mail de recuperação de senha à fila
 */
async function enviarEmailRecuperacaoSenha({ nome, email, token }) {
  try {
    const conteudo = `
      <div style="font-family: sans-serif;">
        <h2>Olá ${nome}!</h2>
        <p>Você solicitou a recuperação de senha da sua conta.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <p><a href="https://art-admin-panel-three.vercel.app/redefinir-senha?token=${token}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir Senha</a></p>
        <p>Este link expira em 1 hora.</p>
        <br>
        <p>Se você não solicitou esta recuperação, ignore este e-mail.</p>
        <p>Equipe Alpha Race Team</p>
      </div>
    `;

    await emailQueueService.adicionarEmail({
      destinatario: email,
      assunto: 'Recuperação de Senha - Alpha Race Team',
      conteudo,
      templateId: 'recuperacao-senha',
      metadata: { nome, tipo: 'recuperacao-senha' },
      prioridade: 8 // Alta prioridade
    });

    logger.info(`E-mail de recuperação adicionado à fila para: ${email}`);
  } catch (error) {
    logger.error('Erro ao adicionar e-mail de recuperação à fila:', error);
    throw error;
  }
}

/**
 * Adiciona e-mail personalizado à fila
 */
async function enviarEmailPersonalizado({ destinatario, assunto, conteudo, prioridade = 0, metadata = {} }) {
  try {
    await emailQueueService.adicionarEmail({
      destinatario,
      assunto,
      conteudo,
      metadata,
      prioridade
    });

    logger.info(`E-mail personalizado adicionado à fila para: ${destinatario}`);
  } catch (error) {
    logger.error('Erro ao adicionar e-mail personalizado à fila:', error);
    throw error;
  }
}

module.exports = {
  enviarEmailCadastro,
  enviarEmailRecuperacaoSenha,
  enviarEmailPersonalizado,
  emailQueueService
};
