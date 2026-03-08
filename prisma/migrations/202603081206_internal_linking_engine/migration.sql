CREATE TABLE IF NOT EXISTS "InternalLinkTarget" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InternalLinkTarget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InternalLinkKeyword" (
  "id" TEXT NOT NULL,
  "keyword" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  CONSTRAINT "InternalLinkKeyword_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "InternalLinkTarget_slug_key" ON "InternalLinkTarget"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "InternalLinkKeyword_keyword_key" ON "InternalLinkKeyword"("keyword");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'InternalLinkKeyword_targetId_fkey'
  ) THEN
    ALTER TABLE "InternalLinkKeyword"
      ADD CONSTRAINT "InternalLinkKeyword_targetId_fkey"
      FOREIGN KEY ("targetId") REFERENCES "InternalLinkTarget"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END
$$;
