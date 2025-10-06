/*
  Warnings:

  - A unique constraint covering the columns `[tipo,componenteId,ordemId]` on the table `Ensaio` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Ensaio_tipo_componenteId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Ensaio_tipo_componenteId_ordemId_key" ON "Ensaio"("tipo", "componenteId", "ordemId");
