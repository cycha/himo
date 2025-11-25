import { prisma } from '../lib/prisma';

async function main() {
  // Find all running bot runs that started more than 30 minutes ago
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const stuckRuns = await prisma.botRun.findMany({
    where: {
      status: 'running',
      startTime: {
        lt: thirtyMinutesAgo,
      },
    },
  });

  console.log(`Found ${stuckRuns.length} stuck runs to fix...`);

  if (stuckRuns.length > 0) {
    // Update all stuck runs to failed status
    const result = await prisma.botRun.updateMany({
      where: {
        status: 'running',
        startTime: {
          lt: thirtyMinutesAgo,
        },
      },
      data: {
        status: 'failed',
        endTime: new Date(),
        errorMessage: 'Run did not complete - marked as failed by cleanup script',
      },
    });

    console.log(`✅ Fixed ${result.count} stuck bot runs`);
  } else {
    console.log('✅ No stuck runs found');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
