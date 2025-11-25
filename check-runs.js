const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himo_user:password123@localhost:5432/himo' } }
});

async function main() {
  const runs = await prisma.botRun.findMany({
    orderBy: { startTime: 'desc' },
    take: 10,
    select: {
      id: true,
      status: true,
      startTime: true,
      endTime: true,
      adsSaved: true,
      pagesScraped: true,
    }
  });

  console.log('Recent Bot Runs:');
  console.log(JSON.stringify(runs, null, 2));

  // Count by status
  const statusCounts = await prisma.botRun.groupBy({
    by: ['status'],
    _count: true,
  });
  console.log('\nStatus counts:');
  console.log(JSON.stringify(statusCounts, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
