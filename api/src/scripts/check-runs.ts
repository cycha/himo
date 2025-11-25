import { prisma } from '../lib/prisma';

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
    },
  });

  console.log('Recent Bot Runs:');
  console.table(runs);

  // Count by status
  const statusCounts = await prisma.botRun.groupBy({
    by: ['status'],
    _count: true,
  });
  console.log('\nStatus counts:');
  console.table(statusCounts);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
