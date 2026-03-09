-- CreateTable
CREATE TABLE "AiVisibilityReport" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "companySlug" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "category" TEXT,
    "visibilityScore" INTEGER,
    "competitors" JSONB NOT NULL,
    "attributes" JSONB NOT NULL,
    "perceptionTable" JSONB NOT NULL,
    "buyerQueries" JSONB NOT NULL,
    "insights" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiVisibilityReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiVisibilityReport_domain_key" ON "AiVisibilityReport"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "AiVisibilityReport_companySlug_key" ON "AiVisibilityReport"("companySlug");

-- CreateIndex
CREATE INDEX "AiVisibilityReport_companySlug_idx" ON "AiVisibilityReport"("companySlug");
