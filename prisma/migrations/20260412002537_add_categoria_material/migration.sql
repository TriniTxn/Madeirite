-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'Geral',
    "unidade" TEXT NOT NULL,
    "quantidade" REAL NOT NULL,
    "minimo" REAL NOT NULL
);
INSERT INTO "new_Material" ("id", "minimo", "nome", "quantidade", "unidade") SELECT "id", "minimo", "nome", "quantidade", "unidade" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
