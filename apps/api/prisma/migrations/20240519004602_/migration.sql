/*
  Warnings:

  - The values [GOOGLE] on the enum `AccountProvider` will be removed. If these variants are still used in the database, this will fail.
  - The values [PASSWORD_RECOVERY] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `user_id` on the `invites` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `organizations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organization_id,user_id]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[domain]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `owner_id` to the `organizations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountProvider_new" AS ENUM ('GITHUB');
ALTER TABLE "accounts" ALTER COLUMN "provider" TYPE "AccountProvider_new" USING ("provider"::text::"AccountProvider_new");
ALTER TYPE "AccountProvider" RENAME TO "AccountProvider_old";
ALTER TYPE "AccountProvider_new" RENAME TO "AccountProvider";
DROP TYPE "AccountProvider_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('PASSWORD_RECOVER');
ALTER TABLE "tokens" ALTER COLUMN "type" TYPE "TokenType_new" USING ("type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "TokenType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "invites" DROP CONSTRAINT "invites_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "invites" DROP CONSTRAINT "invites_user_id_fkey";

-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_owner_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_user_id_fkey";

-- DropIndex
DROP INDEX "members_organization_id_user_id_idx";

-- AlterTable
ALTER TABLE "invites" DROP COLUMN "user_id",
ADD COLUMN     "author_id" TEXT;

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "owner",
ADD COLUMN     "owner_id" TEXT NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "members_organization_id_user_id_key" ON "members"("organization_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_domain_key" ON "organizations"("domain");

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
