-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'QUICK', 'EXTENDED', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('MAILTM', 'ONESECMAIL', 'GUERRILLAMAIL', 'TEMPMAIL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "planExpiresAt" TIMESTAMP(3),
    "apiKey" TEXT,
    "referralCode" TEXT NOT NULL,
    "referredBy" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_emails" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "customDomain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temp_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "tempEmailId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "htmlContent" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "plan" "Plan" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "requests" INTEGER NOT NULL DEFAULT 1,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "event" TEXT NOT NULL,
    "properties" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,

    CONSTRAINT "user_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_analytics" (
    "id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "metadata" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_health" (
    "id" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "isHealthy" BOOLEAN NOT NULL DEFAULT true,
    "responseTime" INTEGER,
    "errorRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "provider_health_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_apiKey_key" ON "users"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "temp_emails_address_key" ON "temp_emails"("address");

-- CreateIndex
CREATE INDEX "temp_emails_address_idx" ON "temp_emails"("address");

-- CreateIndex
CREATE INDEX "temp_emails_expiresAt_idx" ON "temp_emails"("expiresAt");

-- CreateIndex
CREATE INDEX "temp_emails_userId_idx" ON "temp_emails"("userId");

-- CreateIndex
CREATE INDEX "temp_emails_sessionId_idx" ON "temp_emails"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "messages_messageId_key" ON "messages"("messageId");

-- CreateIndex
CREATE INDEX "messages_tempEmailId_idx" ON "messages"("tempEmailId");

-- CreateIndex
CREATE INDEX "messages_receivedAt_idx" ON "messages"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeSessionId_key" ON "payments"("stripeSessionId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "api_usage_userId_idx" ON "api_usage"("userId");

-- CreateIndex
CREATE INDEX "api_usage_date_idx" ON "api_usage"("date");

-- CreateIndex
CREATE UNIQUE INDEX "api_usage_userId_endpoint_date_key" ON "api_usage"("userId", "endpoint", "date");

-- CreateIndex
CREATE INDEX "user_analytics_userId_idx" ON "user_analytics"("userId");

-- CreateIndex
CREATE INDEX "user_analytics_sessionId_idx" ON "user_analytics"("sessionId");

-- CreateIndex
CREATE INDEX "user_analytics_event_idx" ON "user_analytics"("event");

-- CreateIndex
CREATE INDEX "user_analytics_timestamp_idx" ON "user_analytics"("timestamp");

-- CreateIndex
CREATE INDEX "system_analytics_metric_idx" ON "system_analytics"("metric");

-- CreateIndex
CREATE INDEX "system_analytics_date_idx" ON "system_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "system_analytics_metric_date_key" ON "system_analytics"("metric", "date");

-- CreateIndex
CREATE UNIQUE INDEX "provider_health_provider_key" ON "provider_health"("provider");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temp_emails" ADD CONSTRAINT "temp_emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_tempEmailId_fkey" FOREIGN KEY ("tempEmailId") REFERENCES "temp_emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_analytics" ADD CONSTRAINT "user_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
