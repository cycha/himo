-- CreateEnum
CREATE TYPE "BotRunStatus" AS ENUM ('running', 'completed', 'failed', 'stopped');

-- CreateTable
CREATE TABLE "bot_runs" (
    "id" TEXT NOT NULL,
    "status" "BotRunStatus" NOT NULL DEFAULT 'running',
    "start_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMPTZ,
    "ads_saved" INTEGER,
    "pages_scraped" INTEGER,
    "failure_percentage" REAL,
    "average_retries_per_request" REAL,
    "error_message" TEXT,
    "triggered_by" VARCHAR(50),

    CONSTRAINT "bot_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bot_runs_start_time_idx" ON "bot_runs"("start_time" DESC);

-- CreateIndex
CREATE INDEX "bot_runs_status_idx" ON "bot_runs"("status");
