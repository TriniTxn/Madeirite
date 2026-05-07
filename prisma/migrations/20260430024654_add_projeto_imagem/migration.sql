-- CreateTable
CREATE TABLE "ProjetoImagem" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "projetoId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjetoImagem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjetoImagem" ADD CONSTRAINT "ProjetoImagem_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
