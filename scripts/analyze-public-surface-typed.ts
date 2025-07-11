import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
  name: string;
  version: string;
  [key: string]: any;
}

interface PackageExports {
  packageName: string;
  indexPath: string;
  exportCount: number;
  exports: string[];
}

interface PublicSurfaceReport {
  timestamp: string;
  packages: PackageExports[];
  totalExports: number;
  packageCount: number;
  violatingPackages: string[];
}

// Initialize typed arrays
const allPackageExports: PackageExports[] = [];
const violatingPackages: string[] = [];

function isDirectory(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (e) {
    return false;
  }
}

function isFile(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch (e) {
    return false;
  }
}

function findPackages(dir: string, packages: string[] = []): string[] {
  if (!isDirectory(dir)) {
    return packages;
  }

  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const packageJsonPath = path.join(fullPath, 'package.json');

      if (isFile(packageJsonPath)) {
        packages.push(fullPath);
      } else if (isDirectory(fullPath)) {
        findPackages(fullPath, packages);
      }
    }
  } catch (error) {
    console.error(
      `Error reading directory ${dir}:`,
      error instanceof Error ? error.message : String(error)
    );
  }

  return packages;
}

function analyzePackageExports(packagePath: string): PackageExports | null {
  const indexPath = path.join(packagePath, 'src', 'index.ts');

  if (!isFile(indexPath)) {
    console.warn(`No index.ts found in ${packagePath}/src`);
    return null;
  }

  try {
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const packageName = packageJson.name || path.basename(packagePath);

    const content = fs.readFileSync(indexPath, 'utf8');
    const exportMatches =
      content.match(
        /export\s+(?:const|let|var|function|class|interface|type|default)\s+([\w$]+)/g
      ) || [];

    const exports: string[] = [];
    for (const match of exportMatches) {
      const parts = match.split('\s');
      const name = parts[parts.length - 1].trim();
      if (name) {
        exports.push(name);
      }
    }

    return {
      packageName,
      indexPath,
      exportCount: exports.length,
      exports,
    };
  } catch (error) {
    console.error(
      `Error analyzing package at ${packagePath}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

export function analyzePublicSurface(): void {
  console.log('🔍 Analyzing public API surface...');

  // Clear previous results
  allPackageExports.length = 0;
  violatingPackages.length = 0;

  // Find all packages
  const packagesDir = path.join(process.cwd(), 'packages');
  const packages = findPackages(packagesDir);

  if (packages.length === 0) {
    console.warn('No packages found to analyze');
    return;
  }

  // Analyze each package
  for (const pkg of packages) {
    const result = analyzePackageExports(pkg);
    if (result) {
      allPackageExports.push(result);

      // Check for packages with too many exports (more than 10)
      if (result.exportCount > 10) {
        violatingPackages.push(result.packageName);
      }
    }
  }

  // Create metrics directory if it doesn't exist
  const metricsDir = path.join(process.cwd(), 'scripts', 'metrics');
  if (!isDirectory(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  // Generate report
  const report: PublicSurfaceReport = {
    timestamp: new Date().toISOString(),
    packages: allPackageExports,
    totalExports: allPackageExports.reduce((acc, pkg) => acc + pkg.exportCount, 0),
    packageCount: allPackageExports.length,
    violatingPackages,
  };

  // Write report to file
  const reportPath = path.join(metricsDir, 'public-surface-report.json');
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`✅ Report written to ${reportPath}`);
  } catch (error) {
    console.error(
      '❌ Failed to write report:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }

  // Print summary
  console.log('\n📊 Public API Surface Analysis Report');
  console.log('===================================');
  console.log(`📦 Analyzed ${allPackageExports.length} packages`);
  console.log(`📝 Total exports: ${report.totalExports}`);

  if (violatingPackages.length > 0) {
    console.log('\n⚠️  Packages with too many exports (>10):');
    for (const pkgName of violatingPackages) {
      const pkgData = allPackageExports.find((pkg) => pkg.packageName === pkgName);
      if (pkgData) {
        console.log(`   - ${pkgName}: ${pkgData.exportCount} exports`);
      }
    }
  } else {
    console.log('✅ All packages have a reasonable number of exports');
  }

  console.log('\n✨ Analysis complete!');
}

// Run the analysis if this file is executed directly
if (require.main === module) {
  analyzePublicSurface();
}
