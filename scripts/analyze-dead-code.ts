import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DeadCodeResult {
  unusedExports: string[];
  unusedImports: string[];
  timestamp: string;
}

async function analyzeDeadCode(): Promise<void> {
  console.log('🔍 Analyzing dead code...');

  const result: DeadCodeResult = {
    unusedExports: [],
    unusedImports: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // Run ts-prune to find unused exports
    const tsPruneOutput = execSync('npx ts-prune --error', {
      encoding: 'utf8',
      cwd: process.cwd(),
    });

    if (tsPruneOutput.trim()) {
      result.unusedExports = tsPruneOutput
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.trim());
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'stdout' in error && error.stdout) {
      const output = error.stdout.toString();
      if (output.trim()) {
        result.unusedExports = output
          .split('\n')
          .filter((line: string) => line.trim())
          .map((line: string) => line.trim());
      }
    }
  }

  // Ensure metrics directory exists
  const metricsDir = join(process.cwd(), 'scripts', 'metrics');
  if (!existsSync(metricsDir)) {
    mkdirSync(metricsDir, { recursive: true });
  }

  // Generate report
  const reportPath = join(process.cwd(), 'scripts/metrics/dead-code-report.txt');
  const reportContent = `
Dead Code Analysis Report
Generated: ${result.timestamp}

UNUSED EXPORTS (${result.unusedExports.length}):
${result.unusedExports.length > 0 ? result.unusedExports.join('\n') : 'None found'}

SUMMARY:
- Total unused exports: ${result.unusedExports.length}
- Status: ${result.unusedExports.length === 0 ? 'CLEAN' : 'NEEDS CLEANUP'}
`.trim();

  writeFileSync(reportPath, reportContent);

  console.log(`📊 Dead code report written to: ${reportPath}`);
  console.log(`Found ${result.unusedExports.length} unused exports`);

  if (result.unusedExports.length > 0) {
    console.log('\n⚠️  Unused exports found:');
    result.unusedExports.forEach((item) => console.log(`  - ${item}`));
    console.log('\nRun this script interactively to clean up unused code.');
  } else {
    console.log('✅ No dead code detected');
  }
}

// Run if this is the main module
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  analyzeDeadCode().catch((error: unknown) => {
    console.error('❌ Dead code analysis failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

module.exports = { analyzeDeadCode };
