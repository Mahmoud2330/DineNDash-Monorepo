/*
  Warnings:

  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `tableId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- DropIndex
DROP INDEX "CartItem_cartId_menuItemId_key";

-- DropIndex
DROP INDEX "MenuItem_name_restaurantId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "specialNote" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "tableId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "specialNote" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
