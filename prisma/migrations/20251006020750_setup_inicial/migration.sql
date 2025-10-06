-- CreateEnum
CREATE TYPE "public"."NivelAcesso" AS ENUM ('ADMIN', 'GERENTE', 'ENGENHEIRO', 'SUPERVISOR', 'TECNICO', 'OUTRO');

-- CreateEnum
CREATE TYPE "public"."TipoServico" AS ENUM ('MANUTENCAO_PREVENTIVA', 'MANUTENCAO_CORRETIVA', 'MANUTENCAO_PREDITIVA', 'FOTOGRAFICO', 'TERMOGRAFIA', 'ENSAIO_EPI', 'INSTALACAO', 'INSPECAO', 'REFORMA', 'OUTRO');

-- CreateEnum
CREATE TYPE "public"."StatusOrdem" AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'CANCELADA', 'AGUARDANDO_PECAS', 'AGUARDANDO_REVISAO', 'AGUARDANDO_APROVACAO', 'PENDENCIA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "public"."StatusRelatorio" AS ENUM ('NAO_SOLICITADO', 'PENDENTE_APROVACAO', 'APROVADO');

-- CreateEnum
CREATE TYPE "public"."TipoTensao" AS ENUM ('X', 'Y', 'NA');

-- CreateEnum
CREATE TYPE "public"."TipoPressao" AS ENUM ('GAS', 'OLEO');

-- CreateEnum
CREATE TYPE "public"."TipoComponente" AS ENUM ('MALHA', 'RESISTOR', 'PARARAIO', 'CABOMUFLA', 'CHAVE_SECCIONADORA_ALTA', 'CHAVE_SECCIONADORA_MEDIA', 'CHAVE_SECCIONADORA_BAIXA', 'DISJUNTOR_ALTA', 'DISJUNTOR_MEDIA', 'DISJUNTOR_BAIXA', 'TRAFO_ALTA', 'TRAFO_CORRENTE', 'TRAFO_POTENCIAL', 'TRAFO_MEDIA', 'TRAFO_BAIXA', 'BATERIA', 'CAPACITOR', 'BUCHA', 'RELE', 'OUTRO');

-- CreateEnum
CREATE TYPE "public"."TipoFoto" AS ENUM ('INICIAL', 'ANTES', 'DURANTE', 'DEPOIS', 'CLIENTE', 'FUNCIONARIO', 'EQUIPAMENTO', 'SUBESTACAO', 'COMPONENTE', 'ENSAIO', 'RECOMENDACAO', 'OUTRO');

-- CreateTable
CREATE TABLE "public"."Funcionario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "matricula" INTEGER NOT NULL,
    "usuario" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "admissao" TIMESTAMP(3),
    "demissao" TIMESTAMP(3),
    "senhaHash" TEXT NOT NULL,
    "nivelAcesso" "public"."NivelAcesso" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cliente" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT,
    "contato" TEXT,
    "nome" TEXT,
    "nomeResponsavel" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "complemento" TEXT,
    "rua" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ordem" (
    "id" TEXT NOT NULL,
    "numeroOs" TEXT,
    "numeroOrcamento" TEXT,
    "responsavel" TEXT,
    "localizacao" TEXT,
    "email" TEXT,
    "valorServico" DOUBLE PRECISION,
    "contato" TEXT,
    "descricaoInicial" TEXT,
    "observacoes" TEXT,
    "conclusao" TEXT,
    "recomendacoes" TEXT,
    "previsaoInicio" TIMESTAMP(3),
    "previsaoTermino" TIMESTAMP(3),
    "tipoServico" "public"."TipoServico",
    "status" "public"."StatusOrdem" NOT NULL DEFAULT 'ABERTA',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "clienteId" TEXT,
    "engenheiroMatricula" INTEGER,
    "supervisorMatricula" INTEGER,
    "relatorioStatus" "public"."StatusRelatorio" NOT NULL DEFAULT 'NAO_SOLICITADO',
    "relatorioSolicitadoPor" INTEGER,
    "relatorioAprovadoPor" INTEGER,
    "relatorioSolicitadoEm" TIMESTAMP(3),
    "relatorioAprovadoEm" TIMESTAMP(3),
    "finalizacaoSolicitadaPor" INTEGER,
    "finalizacaoSolicitadaEm" TIMESTAMP(3),
    "revisaoAdmPor" INTEGER,
    "revisaoAdmEm" TIMESTAMP(3),
    "aprovacaoPor" INTEGER,
    "aprovacaoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ordem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subestacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "observacao" TEXT,
    "clienteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subestacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Componente" (
    "id" TEXT NOT NULL,
    "nomeEquipamento" TEXT NOT NULL,
    "cliente" TEXT,
    "tag" TEXT,
    "identificacao" TEXT,
    "localizacao" TEXT,
    "modelo" TEXT,
    "fabricante" TEXT,
    "numeroSerie" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "meioIsolante" TEXT,
    "anoFabricacao" TEXT,
    "massaTotal" TEXT,
    "potencia" TEXT,
    "tensao" TEXT,
    "correnteNominal" TEXT,
    "correntePrimario" TEXT,
    "correnteSecundario" TEXT,
    "tensaoNominal" TEXT,
    "tensaoPrimario" TEXT,
    "tensaoSecundario" TEXT,
    "volumeOleoIsolante" TEXT,
    "temperaturaEnsaio" TEXT,
    "impedancia" TEXT,
    "frequencia" TEXT,
    "umidadeRelativaAr" TEXT,
    "exatidao" TEXT,
    "curtoCircuito" TEXT,
    "circuito" TEXT,
    "pressao" TEXT,
    "secaoCabo" TEXT,
    "tipo" "public"."TipoComponente" NOT NULL,
    "tipoTensaoAt" "public"."TipoTensao",
    "tipoTensaoBt" "public"."TipoTensao",
    "tipoPressao" "public"."TipoPressao",
    "subestacaoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Componente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Equipamento" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "descricao" TEXT,
    "modelo" TEXT,
    "numeroSerie" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ensaio" (
    "id" TEXT NOT NULL,
    "tipo" "public"."TipoComponente" NOT NULL,
    "dados" JSONB NOT NULL,
    "dataEnsaio" TIMESTAMP(3),
    "componenteId" TEXT,
    "responsavelMatricula" INTEGER,
    "ordemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ensaio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Foto" (
    "id" TEXT NOT NULL,
    "descricao" TEXT,
    "fotoUrl" TEXT,
    "cloudinaryId" TEXT,
    "tipoFoto" "public"."TipoFoto" NOT NULL,
    "ordemOs" TEXT,
    "clienteId" TEXT,
    "componenteId" TEXT,
    "subestacaoId" TEXT,
    "funcionarioId" TEXT,
    "ensaioId" TEXT,
    "recomendacaoId" TEXT,
    "equipamentoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Recomendacao" (
    "id" TEXT NOT NULL,
    "observacao" TEXT,
    "componenteId" TEXT NOT NULL,
    "subestacaoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recomendacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LogAtividade" (
    "id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "dadosAfetados" JSONB NOT NULL,
    "feitoPor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAtividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AppMeta" (
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "AppMeta_pkey" PRIMARY KEY ("chave")
);

-- CreateTable
CREATE TABLE "public"."_TecnicoOrdem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TecnicoOrdem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_OrdemToSubestacao" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrdemToSubestacao_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ComponenteToOrdem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ComponenteToOrdem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_EquipamentoEnsaio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EquipamentoEnsaio_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_matricula_key" ON "public"."Funcionario"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_usuario_key" ON "public"."Funcionario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Ordem_numeroOs_key" ON "public"."Ordem"("numeroOs");

-- CreateIndex
CREATE UNIQUE INDEX "Ordem_numeroOrcamento_key" ON "public"."Ordem"("numeroOrcamento");

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_numeroSerie_key" ON "public"."Equipamento"("numeroSerie");

-- CreateIndex
CREATE UNIQUE INDEX "Ensaio_tipo_componenteId_ordemId_key" ON "public"."Ensaio"("tipo", "componenteId", "ordemId");

-- CreateIndex
CREATE UNIQUE INDEX "Foto_fotoUrl_key" ON "public"."Foto"("fotoUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Foto_cloudinaryId_key" ON "public"."Foto"("cloudinaryId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_hashedToken_key" ON "public"."RefreshToken"("hashedToken");

-- CreateIndex
CREATE INDEX "_TecnicoOrdem_B_index" ON "public"."_TecnicoOrdem"("B");

-- CreateIndex
CREATE INDEX "_OrdemToSubestacao_B_index" ON "public"."_OrdemToSubestacao"("B");

-- CreateIndex
CREATE INDEX "_ComponenteToOrdem_B_index" ON "public"."_ComponenteToOrdem"("B");

-- CreateIndex
CREATE INDEX "_EquipamentoEnsaio_B_index" ON "public"."_EquipamentoEnsaio"("B");

-- AddForeignKey
ALTER TABLE "public"."Ordem" ADD CONSTRAINT "Ordem_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ordem" ADD CONSTRAINT "Ordem_engenheiroMatricula_fkey" FOREIGN KEY ("engenheiroMatricula") REFERENCES "public"."Funcionario"("matricula") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ordem" ADD CONSTRAINT "Ordem_supervisorMatricula_fkey" FOREIGN KEY ("supervisorMatricula") REFERENCES "public"."Funcionario"("matricula") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subestacao" ADD CONSTRAINT "Subestacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Componente" ADD CONSTRAINT "Componente_subestacaoId_fkey" FOREIGN KEY ("subestacaoId") REFERENCES "public"."Subestacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ensaio" ADD CONSTRAINT "Ensaio_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "public"."Componente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ensaio" ADD CONSTRAINT "Ensaio_responsavelMatricula_fkey" FOREIGN KEY ("responsavelMatricula") REFERENCES "public"."Funcionario"("matricula") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ensaio" ADD CONSTRAINT "Ensaio_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "public"."Ordem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Foto" ADD CONSTRAINT "Foto_ordemOs_fkey" FOREIGN KEY ("ordemOs") REFERENCES "public"."Ordem"("numeroOs") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Foto" ADD CONSTRAINT "Foto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Foto" ADD CONSTRAINT "Foto_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "public"."Componente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Foto" ADD CONSTRAINT "Foto_subestacaoId_fkey" FOREIGN KEY ("subestacaoId") REFERENCES "public"."Subestacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Foto" ADD CONSTRAINT "Foto_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "public"."Funcionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Foto" ADD CONSTRAINT "Foto_ensaioId_fkey" FOREIGN KEY ("ensaioId") REFERENCES "public"."Ensaio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Foto" ADD CONSTRAINT "Foto_recomendacaoId_fkey" FOREIGN KEY ("recomendacaoId") REFERENCES "public"."Recomendacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Foto" ADD CONSTRAINT "Foto_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "public"."Equipamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recomendacao" ADD CONSTRAINT "Recomendacao_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "public"."Componente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recomendacao" ADD CONSTRAINT "Recomendacao_subestacaoId_fkey" FOREIGN KEY ("subestacaoId") REFERENCES "public"."Subestacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "public"."Funcionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TecnicoOrdem" ADD CONSTRAINT "_TecnicoOrdem_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Funcionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TecnicoOrdem" ADD CONSTRAINT "_TecnicoOrdem_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Ordem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OrdemToSubestacao" ADD CONSTRAINT "_OrdemToSubestacao_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Ordem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OrdemToSubestacao" ADD CONSTRAINT "_OrdemToSubestacao_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Subestacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ComponenteToOrdem" ADD CONSTRAINT "_ComponenteToOrdem_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Componente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ComponenteToOrdem" ADD CONSTRAINT "_ComponenteToOrdem_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Ordem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipamentoEnsaio" ADD CONSTRAINT "_EquipamentoEnsaio_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Ensaio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipamentoEnsaio" ADD CONSTRAINT "_EquipamentoEnsaio_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Equipamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
