// src/services/cronService.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Procura e apaga todos os refresh tokens que já expiraram.
 * Esta função é desenhada para ser chamada por uma tarefa agendada.
 */
export const limparRefreshTokensExpirados = async () => {
  console.log('[CRON JOB] Executando a limpeza de refresh tokens expirados...');

  try {
    const agora = new Date();

    // O Prisma irá apagar todos os registos na tabela RefreshToken
    // cuja data de expiração (expiresAt) seja menor ou igual à data/hora atual.
    const resultado = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lte: agora, // lte = Less Than or Equal (menor ou igual a)
        },
      },
    });

    console.log(`[CRON JOB] Limpeza concluída. ${resultado.count} tokens expirados foram apagados.`);
  } catch (error) {
    console.error('[CRON JOB] Erro ao limpar os refresh tokens:', error);
  }
};