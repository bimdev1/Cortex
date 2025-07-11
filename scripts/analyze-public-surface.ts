// @ts-check
'use strict';

// Using require for CommonJS compatibility with type assertions
import * as fs from 'fs';
import * as path from 'path';

interface PackageExports {
  package: string;
  exports: string[];
  exportCount: number;
  packageName: string;
}

/** @typedef {Object} PackageJson
 * @property {string} name - Package name
 * @property {string} version - Package version
 */

/**
 * @typedef {Object} PackageExports
 * @property {string} packageName - Name of the package
 * @property {string} indexPath - Path to the package's index.ts file
 * @property {number} exportCount - Number of exports in the package
 * @property {string[]} exports - List of export names
 */

/**
 * @typedef {Object} PublicSurfaceReport
 * @property {string} timestamp - ISO timestamp of the report
 * @property {PackageExports[]} packages - List of package exports
 * @property {number} totalExports - Total number of exports across all packages
 * @property {number} packageCount - Total number of packages analyzed
 * @property {string[]} violatingPackages - List of packages with too many exports
 */

// Initialize typed arrays with explicit type annotations
// Track all package exports and violations across all packages
const allPackageExports: PackageExports[] = [];

// Track packages with too many exports
const violatingPackages: string[] = [];

/**
 * Checks if a path is a directory
 * @param {string} dirPath - The path to check
 * @returns {boolean} True if the path is a directory
 */
function isDirectory(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (e) {
    return false;
  }
}

/**
 * Checks if a path is a file
 * @param {string} filePath - The path to check
 * @returns {boolean} True if the path is a file
 */
function isFile(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch (e) {
    return false;
  }
}

/**
 * Recursively finds all package directories
 * @param {string} dir - The directory to search in
 * @param {string[]} [packages=[]] - Accumulator for package paths
 * @returns {string[]} Array of package directory paths
 */
function findPackages(dir: string, packages: string[] = []): string[] {
  if (!isDirectory(dir)) {
    return packages;
  }

  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      if (isDirectory(fullPath) && typeof fullPath === 'string') {
        const packageJsonPath = path.join(fullPath, 'package.json');

        if (isFile(packageJsonPath)) {
          packages.push(fullPath);
        } else if (isDirectory(fullPath)) {
          findPackages(fullPath, packages);
        }
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

/**
 * Analyzes a single package's exports
 * @param {string} packagePath - Path to the package directory
 * @returns {PackageExports | null} Analysis result or null if analysis fails
 */
function analyzePackageExports(packagePath: string): PackageExports | null {
  const indexPath = path.join(packagePath, 'src', 'index.ts');

  if (!isFile(indexPath)) {
    console.warn(`No index.ts found in ${packagePath}/src`);
    // Read package.json to get the package name
    const packageJsonPath = path.join(packagePath, 'package.json');
    let packageName = path.basename(packagePath);

    if (isFile(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageName = pkg.name || packageName;
      } catch (e) {
        console.warn(`⚠️  Could not read package.json in ${packagePath}`);
      }
    }

    return {
      package: packagePath,
      exports: [],
      exportCount: 0,
      packageName,
    };
  }

  try {
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const packageName = packageJson.name || path.basename(packagePath);

    const content = fs.readFileSync(indexPath, 'utf8');
    const exportRegex =
      /export\s+(?:const|function|class|interface|type|enum|\{.*?\}|\*)\s+([a-zA-Z0-9_$]+)/g;
    const exportMatches = Array.from(content.matchAll(exportRegex), (match) => match[1]) || [];

    const exportsList: string[] = [];
    for (const match of exportMatches) {
      const parts = match.split('\s');
      const name = parts[parts.length - 1].trim();
      if (name && !name.startsWith('//')) {
        exportsList.push(name);
      }
    }

    return {
      package: packagePath,
      exports: exportsList,
      exportCount: exportsList.length,
      packageName,
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${packagePath}:`, error);
    return {
      package: packagePath,
      exports: [],
      exportCount: 0,
      packageName: path.basename(packagePath),
    };
  }
}

/**
 * Main function to analyze all packages in the monorepo
 */
function analyzeMonorepo(): void {
  console.log('🔍 Analyzing public API surface...');

  // Clear previous results
  allPackageExports.length = 0;
  violatingPackages.length = 0;

  // Find all packages in the monorepo
  const packagesDir = path.join(__dirname, '../../packages');
  const packages = findPackages(packagesDir);
  console.log(`Found ${packages.length} packages to analyze\n`);

  // Analyze each package
  for (const pkgPath of packages) {
    const result = analyzePackageExports(pkgPath);
    if (result) {
      allPackageExports.push(result);

      // Check for packages with too many exports
      if (result.exportCount > 10) {
        violatingPackages.push(result.packageName);
      }
    }
  }

  // Generate report
  generateReport();
}

/**
 * Generates a report of the public API surface analysis
 */
function generateReport(): void {
  const totalExports = allPackageExports.reduce((sum, pkg) => sum + pkg.exportCount, 0);
  const averageExports =
    allPackageExports.length > 0
      ? Math.round((totalExports / allPackageExports.length) * 100) / 100
      : 0;

  const report = {
    timestamp: new Date().toISOString(),
    packages: allPackageExports.map((pkg) => ({
      packageName: pkg.packageName,
      path: pkg.package,
      exportCount: pkg.exportCount,
      exports: pkg.exports,
    })),
    totalExports,
    averageExportsPerPackage: averageExports,
    violatingPackages: violatingPackages.map((pkgName) => ({
      packageName: pkgName,
      exportCount: allPackageExports.find((p) => p.packageName === pkgName)?.exportCount || 0,
    })),
  };

  // Create metrics directory if it doesn't exist
  const metricsDir = path.join(__dirname, 'metrics');
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  // Write JSON report
  const reportPath = path.join(metricsDir, 'public-surface-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ Report written to ${reportPath}\n`);

  // Print summary
  console.log('📊 Public API Surface Analysis Report');
  console.log('='.repeat(50));
  console.log(`📦 Analyzed ${allPackageExports.length} packages`);
  console.log(`📝 Total exports: ${totalExports}`);
  console.log(`📊 Average exports per package: ${averageExports.toFixed(2)}`);

  if (violatingPackages.length > 0) {
    console.log(`\n⚠️  Packages with too many exports (>10):`);
    for (const pkgName of violatingPackages) {
      const pkg = allPackageExports.find((p) => p.packageName === pkgName);
      if (pkg) {
        console.log(`   - ${pkgName}: ${pkg.exportCount} exports`);
      }
    }
  } else {
    console.log('\n✅ All packages have a reasonable number of exports');
  }

  console.log('\n✨ Analysis complete!');
}

// Run the analysis
if (require.main === module) {
  analyzeMonorepo();
}

export { analyzeMonorepo, analyzePackageExports, PackageExports };
