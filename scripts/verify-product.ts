import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const productId = process.argv[2];
  if (!productId) {
    const count = await prisma.product.count();
    console.log(`Total products in DB: ${count}`);
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: { select: { email: true, name: true } } },
  });

  console.log(JSON.stringify(product, null, 2));
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
