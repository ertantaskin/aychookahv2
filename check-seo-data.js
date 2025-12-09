const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSEOData() {
  const product = await prisma.product.findUnique({
    where: { slug: 'go-pro-mini' },
    select: {
      id: true,
      name: true,
      slug: true,
      seoTitle: true,
      seoDescription: true,
      metaKeywords: true,
      ogImage: true,
      brand: true,
    },
  });
  
  console.log('Product SEO Data:', JSON.stringify(product, null, 2));
  await prisma.$disconnect();
}

checkSEOData().catch(console.error);
