-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Componente" (
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
    "tipo" TEXT NOT NULL,
    "tipoTensaoAt" TEXT,
    "tipoTensaoBt" TEXT,
    "tipoPressao" TEXT,
    "subestacaoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Componente_subestacaoId_fkey" FOREIGN KEY ("subestacaoId") REFERENCES "Subestacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Componente" ("anoFabricacao", "circuito", "cliente", "correnteNominal", "correntePrimario", "correnteSecundario", "createdAt", "curtoCircuito", "exatidao", "fabricante", "frequencia", "id", "identificacao", "impedancia", "localizacao", "massaTotal", "meioIsolante", "modelo", "nomeEquipamento", "numeroSerie", "potencia", "pressao", "quantidade", "secaoCabo", "subestacaoId", "tag", "temperaturaEnsaio", "tensao", "tensaoNominal", "tensaoPrimario", "tensaoSecundario", "tipo", "tipoPressao", "tipoTensaoAt", "tipoTensaoBt", "umidadeRelativaAr", "updatedAt", "volumeOleoIsolante") SELECT "anoFabricacao", "circuito", "cliente", "correnteNominal", "correntePrimario", "correnteSecundario", "createdAt", "curtoCircuito", "exatidao", "fabricante", "frequencia", "id", "identificacao", "impedancia", "localizacao", "massaTotal", "meioIsolante", "modelo", "nomeEquipamento", "numeroSerie", "potencia", "pressao", "quantidade", "secaoCabo", "subestacaoId", "tag", "temperaturaEnsaio", "tensao", "tensaoNominal", "tensaoPrimario", "tensaoSecundario", "tipo", "tipoPressao", "tipoTensaoAt", "tipoTensaoBt", "umidadeRelativaAr", "updatedAt", "volumeOleoIsolante" FROM "Componente";
DROP TABLE "Componente";
ALTER TABLE "new_Componente" RENAME TO "Componente";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
