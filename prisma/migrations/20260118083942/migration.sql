-- CreateTable
CREATE TABLE "AddressHierarchy" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "voided" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AddressHierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AddressHierarchy_country_level_idx" ON "AddressHierarchy"("country", "level");

-- CreateIndex
CREATE INDEX "AddressHierarchy_parentId_idx" ON "AddressHierarchy"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "AddressHierarchy_country_code_key" ON "AddressHierarchy"("country", "code");

-- AddForeignKey
ALTER TABLE "AddressHierarchy" ADD CONSTRAINT "AddressHierarchy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AddressHierarchy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
