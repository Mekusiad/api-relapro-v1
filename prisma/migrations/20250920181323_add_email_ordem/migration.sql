/*
  Warnings:

  - You are about to drop the column `contatoCliente` on the `Ordem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ordem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroOs" TEXT,
    "numeroOrcamento" TEXT,
    "responsavel" TEXT,
    "localizacao" TEXT,
    "email" TEXT,
    "valorServico" REAL,
    "contato" TEXT,
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
INSERT INTO "new_Ordem" ("aprovacaoEm", "aprovacaoPor", "clienteId", "conclusao", "createdAt", "descricaoInicial", "engenheiroMatricula", "finalizacaoSolicitadaEm", "finalizacaoSolicitadaPor", "id", "latitude", "localizacao", "longitude", "numeroOrcamento", "numeroOs", "observacoes", "previsaoInicio", "previsaoTermino", "recomendacoes", "relatorioAprovadoEm", "relatorioAprovadoPor", "relatorioSolicitadoEm", "relatorioSolicitadoPor", "relatorioStatus", "responsavel", "revisaoAdmEm", "revisaoAdmPor", "status", "supervisorMatricula", "tipoServico", "updatedAt", "valorServico") SELECT "aprovacaoEm", "aprovacaoPor", "clienteId", "conclusao", "createdAt", "descricaoInicial", "engenheiroMatricula", "finalizacaoSolicitadaEm", "finalizacaoSolicitadaPor", "id", "latitude", "localizacao", "longitude", "numeroOrcamento", "numeroOs", "observacoes", "previsaoInicio", "previsaoTermino", "recomendacoes", "relatorioAprovadoEm", "relatorioAprovadoPor", "relatorioSolicitadoEm", "relatorioSolicitadoPor", "relatorioStatus", "responsavel", "revisaoAdmEm", "revisaoAdmPor", "status", "supervisorMatricula", "tipoServico", "updatedAt", "valorServico" FROM "Ordem";
DROP TABLE "Ordem";
ALTER TABLE "new_Ordem" RENAME TO "Ordem";
CREATE UNIQUE INDEX "Ordem_numeroOs_key" ON "Ordem"("numeroOs");
CREATE UNIQUE INDEX "Ordem_numeroOrcamento_key" ON "Ordem"("numeroOrcamento");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
