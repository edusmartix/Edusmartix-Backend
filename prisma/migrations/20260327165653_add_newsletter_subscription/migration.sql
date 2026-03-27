-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
    "id" SERIAL NOT NULL,
    "school_name" TEXT,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);
