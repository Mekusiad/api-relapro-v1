/*
  Warnings:

  - You are about to drop the column `nomeEmpresa` on the `Cliente` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cnpj" INTEGER,
    "contato" INTEGER,
    "nome" TEXT,
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
INSERT INTO "new_Cliente" ("bairro", "cep", "cidade", "cnpj", "complemento", "contato", "createdAt", "email", "estado", "id", "nomeResponsavel", "numero", "rua", "updatedAt") SELECT "bairro", "cep", "cidade", "cnpj", "complemento", "contato", "createdAt", "email", "estado", "id", "nomeResponsavel", "numero", "rua", "updatedAt" FROM "Cliente";
DROP TABLE "Cliente";
ALTER TABLE "new_Cliente" RENAME TO "Cliente";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
