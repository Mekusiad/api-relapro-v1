-- CreateTable
CREATE TABLE "Funcionario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "matricula" INTEGER NOT NULL,
    "usuario" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "admissao" DATETIME,
    "demissao" DATETIME,
    "senhaHash" TEXT NOT NULL,
    "nivelAcesso" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cnpj" INTEGER,
    "contato" INTEGER,
    "nomeEmpresa" TEXT,
    "nomeResponsavel" TEXT,
    "email" TEXT,
    "complemento" TEXT,
    "rua" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Ordem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroOs" TEXT,
    "numeroOrcamento" TEXT,
    "descricaoInicial" TEXT,
    "observacoes" TEXT,
    "conclusao" TEXT,
    "recomendacoes" TEXT,
    "previsaoInicio" DATETIME,
    "previsaoTermino" DATETIME,
    "tipoServico" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "latitude" REAL,
    "longitude" REAL,
    "clienteId" TEXT,
    "engenheiroMatricula" INTEGER,
    "supervisorMatricula" INTEGER,
    "relatorioStatus" TEXT NOT NULL DEFAULT 'NAO_SOLICITADO',
    "relatorioSolicitadoPor" INTEGER,
    "relatorioAprovadoPor" INTEGER,
    "relatorioSolicitadoEm" DATETIME,
    "relatorioAprovadoEm" DATETIME,
    "finalizacaoSolicitadaPor" INTEGER,
    "finalizacaoSolicitadaEm" DATETIME,
    "revisaoAdmPor" INTEGER,
    "revisaoAdmEm" DATETIME,
    "aprovacaoPor" INTEGER,
    "aprovacaoEm" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ordem_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ordem_engenheiroMatricula_fkey" FOREIGN KEY ("engenheiroMatricula") REFERENCES "Funcionario" ("matricula") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ordem_supervisorMatricula_fkey" FOREIGN KEY ("supervisorMatricula") REFERENCES "Funcionario" ("matricula") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subestacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT,
    "observacao" TEXT,
    "clienteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subestacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Componente" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "anoFabricacao" INTEGER,
    "massaTotal" REAL,
    "potencia" TEXT,
    "correnteNominal" REAL,
    "correntePrimario" REAL,
    "correnteSecundario" REAL,
    "tensaoNominal" REAL,
    "tensaoPrimario" TEXT,
    "tensaoSecundario" TEXT,
    "volumeOleoIsolante" REAL,
    "temperaturaEnsaio" REAL,
    "impedancia" REAL,
    "frequencia" TEXT,
    "umidadeRelativaAr" REAL,
    "exatidao" TEXT,
    "curtoCircuito" TEXT,
    "circuito" TEXT,
    "pressao" REAL,
    "bitolaCabo" REAL,
    "tipo" TEXT NOT NULL,
    "tipoTensaoAt" TEXT,
    "tipoTensaoBt" TEXT,
    "tipoPressao" TEXT,
    "subestacaoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Componente_subestacaoId_fkey" FOREIGN KEY ("subestacaoId") REFERENCES "Subestacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT,
    "descricao" TEXT,
    "modelo" TEXT,
    "numeroSerie" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Ensaio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "dados" JSONB NOT NULL,
    "dataEnsaio" DATETIME,
    "componenteId" TEXT,
    "responsavelMatricula" INTEGER,
    "ordemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ensaio_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "Componente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ensaio_responsavelMatricula_fkey" FOREIGN KEY ("responsavelMatricula") REFERENCES "Funcionario" ("matricula") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ensaio_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "Ordem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT,
    "fotoUrl" TEXT,
    "cloudinaryId" TEXT,
    "tipoFoto" TEXT NOT NULL,
    "ordemOs" TEXT,
    "clienteId" TEXT,
    "componenteId" TEXT,
    "subestacaoId" TEXT,
    "funcionarioId" TEXT,
    "ensaioId" TEXT,
    "recomendacaoId" TEXT,
    "equipamentoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Foto_ordemOs_fkey" FOREIGN KEY ("ordemOs") REFERENCES "Ordem" ("numeroOs") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Foto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Foto_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "Componente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Foto_subestacaoId_fkey" FOREIGN KEY ("subestacaoId") REFERENCES "Subestacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Foto_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Foto_ensaioId_fkey" FOREIGN KEY ("ensaioId") REFERENCES "Ensaio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Foto_recomendacaoId_fkey" FOREIGN KEY ("recomendacaoId") REFERENCES "Recomendacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Foto_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recomendacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "observacao" TEXT,
    "componenteId" TEXT NOT NULL,
    "subestacaoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recomendacao_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "Componente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recomendacao_subestacaoId_fkey" FOREIGN KEY ("subestacaoId") REFERENCES "Subestacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LogAtividade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "dadosAfetados" JSONB NOT NULL,
    "feitoPor" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hashedToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RefreshToken_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppMeta" (
    "chave" TEXT NOT NULL PRIMARY KEY,
    "valor" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TecnicoOrdem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TecnicoOrdem_A_fkey" FOREIGN KEY ("A") REFERENCES "Funcionario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TecnicoOrdem_B_fkey" FOREIGN KEY ("B") REFERENCES "Ordem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_OrdemToSubestacao" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_OrdemToSubestacao_A_fkey" FOREIGN KEY ("A") REFERENCES "Ordem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_OrdemToSubestacao_B_fkey" FOREIGN KEY ("B") REFERENCES "Subestacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ComponenteToOrdem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ComponenteToOrdem_A_fkey" FOREIGN KEY ("A") REFERENCES "Componente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ComponenteToOrdem_B_fkey" FOREIGN KEY ("B") REFERENCES "Ordem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EquipamentoEnsaio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EquipamentoEnsaio_A_fkey" FOREIGN KEY ("A") REFERENCES "Ensaio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EquipamentoEnsaio_B_fkey" FOREIGN KEY ("B") REFERENCES "Equipamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_matricula_key" ON "Funcionario"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_usuario_key" ON "Funcionario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Ordem_numeroOs_key" ON "Ordem"("numeroOs");

-- CreateIndex
CREATE UNIQUE INDEX "Ordem_numeroOrcamento_key" ON "Ordem"("numeroOrcamento");

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_numeroSerie_key" ON "Equipamento"("numeroSerie");

-- CreateIndex
CREATE UNIQUE INDEX "Ensaio_tipo_componenteId_key" ON "Ensaio"("tipo", "componenteId");

-- CreateIndex
CREATE UNIQUE INDEX "Foto_fotoUrl_key" ON "Foto"("fotoUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Foto_cloudinaryId_key" ON "Foto"("cloudinaryId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_hashedToken_key" ON "RefreshToken"("hashedToken");

-- CreateIndex
CREATE UNIQUE INDEX "_TecnicoOrdem_AB_unique" ON "_TecnicoOrdem"("A", "B");

-- CreateIndex
CREATE INDEX "_TecnicoOrdem_B_index" ON "_TecnicoOrdem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrdemToSubestacao_AB_unique" ON "_OrdemToSubestacao"("A", "B");

-- CreateIndex
CREATE INDEX "_OrdemToSubestacao_B_index" ON "_OrdemToSubestacao"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ComponenteToOrdem_AB_unique" ON "_ComponenteToOrdem"("A", "B");

-- CreateIndex
CREATE INDEX "_ComponenteToOrdem_B_index" ON "_ComponenteToOrdem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EquipamentoEnsaio_AB_unique" ON "_EquipamentoEnsaio"("A", "B");

-- CreateIndex
CREATE INDEX "_EquipamentoEnsaio_B_index" ON "_EquipamentoEnsaio"("B");
