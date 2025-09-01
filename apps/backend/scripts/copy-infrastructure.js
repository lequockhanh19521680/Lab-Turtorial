import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as fsExtra from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyInfrastructure() {
  try {
    console.log("Environment info:");
    console.log("CWD:", process.cwd());
    console.log("__dirname:", __dirname);

    const projectRoot = path.resolve(__dirname, "../../..");
    console.log("Project root:", projectRoot);

    const sourceDir = path.resolve(projectRoot, "packages/infrastructure/dist");
    const packageJsonPath = path.resolve(
      projectRoot,
      "packages/infrastructure/package.json"
    );

    // Verify source exists
    if (!(await fsExtra.pathExists(sourceDir))) {
      throw new Error(`Source directory not found: ${sourceDir}`);
    }
    if (!(await fsExtra.pathExists(packageJsonPath))) {
      throw new Error(`package.json not found at: ${packageJsonPath}`);
    }

    // Copy to handlers directory
    const handlersDir = path.resolve(
      process.cwd(),
      "dist/handlers/node_modules/@lab-tutorial/infrastructure"
    );
    console.log(`Copying to handlers directory: ${handlersDir}`);
    await fs.mkdir(path.dirname(handlersDir), { recursive: true });
    await fsExtra.copy(sourceDir, handlersDir);
    await fsExtra.copy(
      packageJsonPath,
      path.resolve(handlersDir, "package.json")
    );
    console.log("✓ Copied to handlers directory");

    // Copy to agents directory
    const agentsDir = path.resolve(
      process.cwd(),
      "dist/agents/node_modules/@lab-tutorial/infrastructure"
    );
    console.log(`Copying to agents directory: ${agentsDir}`);
    await fs.mkdir(path.dirname(agentsDir), { recursive: true });
    await fsExtra.copy(sourceDir, agentsDir);
    await fsExtra.copy(
      packageJsonPath,
      path.resolve(agentsDir, "package.json")
    );
    console.log("✓ Copied to agents directory");
  } catch (error) {
    console.error("Error copying infrastructure:", error);
    process.exit(1);
  }
}

copyInfrastructure().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
