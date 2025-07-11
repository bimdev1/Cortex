import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
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

function findPackages(rootDir: string, packages: string[] = []): string[] {
  if (!isDirectory(rootDir)) {
    console.warn(`Directory not found: ${rootDir}`);
    return packages;
  }

  try {
    const entries = fs.readdirSync(rootDir);

    // First, check if this directory is a package (has package.json)
    const packageJsonPath = path.join(rootDir, 'package.json');
    if (isFile(packageJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson;
        // Only include non-private packages
        if (!pkgJson.private) {
          packages.push(rootDir);
          return packages; // Don't look for nested packages
        }
      } catch (e) {
        console.warn(
          `Error reading package.json in ${rootDir}:`,
          e instanceof Error ? e.message : String(e)
        );
      }
    }

    // Then check subdirectories
    for (const entry of entries) {
      if (entry === 'node_modules' || entry.startsWith('.')) {
        continue; // Skip node_modules and hidden directories
      }

      const fullPath = path.join(rootDir, entry);
      if (isDirectory(fullPath)) {
        findPackages(fullPath, packages);
      }
    }
  } catch (error) {
    console.error(
      `Error reading directory ${rootDir}:`,
      error instanceof Error ? error.message : String(error)
    );
  }

  return packages;
}

function analyzePackageExports(packagePath: string): PackageExports | null {
  // Check for both src/index.ts and index.ts
  const possibleIndexPaths = [
    path.join(packagePath, 'src', 'index.ts'),
    path.join(packagePath, 'index.ts'),
    path.join(packagePath, 'src', 'index.tsx'),
    path.join(packagePath, 'index.tsx'),
  ];

  let indexPath = '';
  for (const possiblePath of possibleIndexPaths) {
    if (isFile(possiblePath)) {
      indexPath = possiblePath;
      break;
    }
  }

  if (!indexPath) {
    console.warn(`No index file found in ${packagePath}`);
    return null;
  }

  try {
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const packageName = packageJson.name || path.basename(packagePath);

    const content = fs.readFileSync(indexPath, 'utf8');
    let exports: string[] = [];

    // If index file is empty or just contains comments, search in common source directories
    const isEmptyOrOnlyComments =
      content.trim() === '' || /^\/\*[\s\S]*?\*\/|([^:]\/\/.*|^\/\/.*|^#.*|^\s*$)/gm.test(content);

    if (isEmptyOrOnlyComments) {
      console.log(
        `   Index file is empty or contains only comments, checking source directories...`
      );

      // Common directories to search for source files
      const sourceDirs = [
        path.join(packagePath, 'src'),
        path.join(packagePath, 'client'),
        path.join(packagePath, 'server'),
        path.join(packagePath, 'lib'),
      ];

      for (const sourceDir of sourceDirs) {
        if (isDirectory(sourceDir)) {
          const sourceFiles = findFilesByExtension(sourceDir, ['.ts', '.tsx', '.js', '.jsx']);
          console.log(
            `   Found ${sourceFiles.length} source files in ${path.relative(packagePath, sourceDir)}/`
          );

          // Collect exports from all source files
          for (const file of sourceFiles) {
            try {
              const fileContent = fs.readFileSync(file, 'utf8');
              const fileExports = extractExports(fileContent);

              // Only add exports if we found any
              if (fileExports.length > 0) {
                const relativePath = path.relative(packagePath, file);
                console.log(`     Found ${fileExports.length} exports in ${relativePath}`);
                exports = [...exports, ...fileExports];
              }
            } catch (error) {
              console.warn(
                `   Error reading ${file}:`,
                error instanceof Error ? error.message : String(error)
              );
            }
          }
        }
      }
    } else {
      // Parse exports from index file
      exports = extractExports(content);
    }

    // Helper function to find files by extension
    function findFilesByExtension(dir: string, extensions: string[]): string[] {
      let results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          results = [...results, ...findFilesByExtension(fullPath, extensions)];
        } else if (
          entry.isFile() &&
          extensions.some((ext) => entry.name.endsWith(ext)) &&
          !entry.name.endsWith('.d.ts') && // Skip declaration files
          !entry.name.endsWith('.test.ts') && // Skip test files
          !entry.name.endsWith('.spec.ts')
        ) {
          // Skip spec files
          results.push(fullPath);
        }
      }

      return results;
    }

    // Helper function to extract exports from file content
    function extractExports(content: string): string[] {
      const exportMatches =
        content.match(
          /export\s+(?:const|let|var|function|class|interface|type|default)\s+([\w$]+)/g
        ) || [];
      const exportDefaultMatches = content.match(/export\s+default\s+([\w$]+|\{)/g) || [];
      const exportFromMatches = content.match(/export\s+\*\s+from\s+['"](.+)['"]/g) || [];
      const exportNamedFromMatches =
        content.match(/export\s+\{[^}]*\}\s+from\s+['"](.+)['"]/g) || [];

      return [
        ...exportMatches.map((match) => {
          const parts = match.split(/\s+/);
          return parts[parts.length - 1];
        }),
        ...exportDefaultMatches.map(() => 'default'),
        ...exportFromMatches.map((match) => {
          const parts = match.match(/from\s+['"](.+)['"]/);
          return parts ? `* from ${parts[1]}` : '';
        }),
        ...exportNamedFromMatches.map((match) => {
          const parts = match.match(/from\s+['"](.+)['"]/);
          return parts ? `{...} from ${parts[1]}` : '';
        }),
      ].filter(
        (value, index, self) =>
          value && // Remove empty strings
          self.indexOf(value) === index // Remove duplicates
      );
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

  // Find all packages in the packages directory (one level up from scripts)
  const packagesDir = path.join(process.cwd(), '..', 'packages');
  console.log(`Looking for packages in: ${packagesDir}`);

  // Get all subdirectories in the packages directory
  const packageCategories = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(packagesDir, dirent.name));

  // Find packages in each subdirectory
  let allPackages: string[] = [];
  for (const category of packageCategories) {
    console.log(`Searching for packages in category: ${path.basename(category)}`);
    const packagesInCategory = findPackages(category);
    allPackages = [...allPackages, ...packagesInCategory];
  }

  console.log(`Found ${allPackages.length} packages to analyze`);

  if (allPackages.length === 0) {
    console.warn('No packages found to analyze');
    return;
  }

  // Analyze each package
  for (const pkg of allPackages) {
    console.log(`\n📦 Analyzing package: ${path.basename(pkg)}`);
    const result = analyzePackageExports(pkg);
    if (result) {
      allPackageExports.push(result);
      console.log(`   Found ${result.exportCount} exports`);

      // Check for packages with too many exports (more than 10)
      if (result.exportCount > 10) {
        violatingPackages.push(result.packageName);
        console.log(`   ⚠️  Package has ${result.exportCount} exports (more than 10)`);
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
    console.log(`\n✅ Report written to ${reportPath}`);
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
        if (pkgData.exportCount > 20) {
          console.log('      Consider splitting this package into smaller, more focused modules');
        }
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
