-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Projeto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Em Produção',
    "dataEntrega" DATETIME NOT NULL,
    "anotacoes" TEXT,
    "clienteId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Projeto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Projeto" ("anotacoes", "clienteId", "criadoEm", "dataEntrega", "id", "nome") SELECT "anotacoes", "clienteId", "criadoEm", "dataEntrega", "id", "nome" FROM "Projeto";
DROP TABLE "Projeto";
ALTER TABLE "new_Projeto" RENAME TO "Projeto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
