
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o processo de seed...');

  // --- VERIFICAÇÃO DA FLAG ---
  const seedFlag = await prisma.appMeta.findUnique({
    where: { chave: 'initial_seed_executed' },
  });

  if (seedFlag && seedFlag.valor === 'true') {
    console.log('O seed inicial já foi executado anteriormente. A sair.');
    return; 
  }
  // --- FIM DA VERIFICAÇÃO ---


  const adminMatricula = Number(process.env.SEED_ADMIN_MATRICULA);
  const adminUsuario = process.env.SEED_ADMIN_USER;
  const adminSenhaPlana = process.env.SEED_ADMIN_PASSWORD;

  if (!adminMatricula || !adminUsuario || !adminSenhaPlana) {
    throw new Error(
      'Por favor, defina SEED_ADMIN_MATRICULA, SEED_ADMIN_USER, e SEED_ADMIN_PASSWORD no seu ficheiro .env'
    );
  }

  const senhaHash = await bcrypt.hash(adminSenhaPlana, 10);

  await prisma.funcionario.upsert({
    where: { matricula: adminMatricula },
    update: {},
    create: {
      nome: 'Administrador do Sistema',
      matricula: adminMatricula,
      usuario: adminUsuario,
      senhaHash: senhaHash,
      cargo: 'ADMINISTRADOR',
      nivelAcesso: 'ADMIN',
      admissao: new Date(),
    },
  });

  console.log(`Utilizador ADMIN '${adminUsuario}' criado/verificado com sucesso!`);

  // --- GRAVAR A FLAG DE SUCESSO ---
  await prisma.appMeta.upsert({
    where: { chave: 'initial_seed_executed' },
    update: { valor: 'true' },
    create: { chave: 'initial_seed_executed', valor: 'true' },
  });

  console.log('Seed finalizado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });