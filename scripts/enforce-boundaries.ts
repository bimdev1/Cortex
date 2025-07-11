import { readdirSync, statSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Recursively finds all package directories under the given directory
 * @param {string} dir The directory to search in
 * @returns {string[]} Array of package directory paths
 */
function findPackageDirectories(dir: string): string[] {
  /** @type {string[]} */
  const packages = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      if (stat?.isDirectory?.()) {
        try {
          if (existsSync(join(fullPath, 'package.json'))) {
            packages.push(fullPath);
          } else {
            // Recursively search subdirectories
            packages.push(...findPackageDirectories(fullPath));
          }
        } catch (error) {
          // Ignore errors and continue
          console.warn(
            `Error processing ${fullPath}:`,
            error instanceof Error ? error.message : String(error)
          );
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
 * Enforces module boundaries by ensuring each package has proper structure
 * @returns {Promise<void>}
 */
async function enforceModuleBoundaries() {
  try {
    console.log(' Enforcing module boundaries...');

    // Ensure each package has proper index.ts
    const packagesDir = join(process.cwd(), 'packages');
    const packages = findPackageDirectories(packagesDir);

    for (const packagePath of packages) {
      const indexPath = join(packagePath, 'index.ts');
      const srcPath = join(packagePath, 'src');
      const metricsDir = join(__dirname, 'metrics');

      // Create metrics directory if it doesn't exist
      if (!existsSync(metricsDir)) {
        mkdirSync(metricsDir, { recursive: true });
      }

      // Create src directory if it doesn't exist
      try {
        if (!existsSync(srcPath)) {
          mkdirSync(srcPath, { recursive: true });
          console.log(` Created src directory for ${dirname(packagePath)}`);
        }
      } catch (error) {
        console.error(
          ` Failed to create src directory for ${packagePath}:`,
          error instanceof Error ? error.message : String(error)
        );
        continue;
      }

      // Ensure index.ts exists
      if (!existsSync(indexPath)) {
        try {
          const packageJsonPath = join(packagePath, 'package.json');
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          const packageName = packageJson.name || basename(packagePath);

          const indexContent = `// ${packageName} public API
// Export only public interfaces and classes

// TODO: Add specific exports from src/
`;
          writeFileSync(indexPath, indexContent);
          console.log(` Created index.ts for ${packageName}`);
        } catch (error) {
          console.error(
            ` Failed to create index.ts for ${packagePath}:`,
            error instanceof Error ? error.message : String(error)
          );
          continue;
        }
      }
    }

    console.log(' Module boundaries enforced');
  } catch (error) {
    console.error(' Module boundary enforcement failed:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  enforceModuleBoundaries()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(' Module boundary enforcement failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}

export default enforceModuleBoundaries;
