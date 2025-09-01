import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to copy utils directory
async function copyUtils(targetDir) {
  const utilsSrc = path.resolve(__dirname, "..", "dist", "utils");
  const utilsDest = path.join(targetDir, "utils");

  if (
    await fs
      .access(utilsSrc)
      .then(() => true)
      .catch(() => false)
  ) {
    await fs.mkdir(utilsDest, { recursive: true });
    await fs.cp(utilsSrc, utilsDest, {
      recursive: true,
      force: true,
    });
  }
}

async function injectFiles(targetDir, config) {
  const targetPath = path.resolve(targetDir);
  await fs.mkdir(targetPath, { recursive: true });

  // Remove undefined dependencies
  const cleanConfig = {
    ...config,
    dependencies: Object.fromEntries(
      Object.entries(config.dependencies).filter(
        ([_, value]) => value !== undefined
      )
    ),
  };

  // Write package.json
  const packageJsonPath = path.join(targetPath, "package.json");
  await fs.writeFile(packageJsonPath, JSON.stringify(cleanConfig, null, 2));

  // Write .npmrc
  const npmrcPath = path.join(targetPath, ".npmrc");
  await fs.writeFile(npmrcPath, "legacy-peer-deps=true\nnode-linker=hoisted");

  // Copy utils directory
  await copyUtils(targetPath);
}

async function injectPackageJson() {
  try {
    // Read the necessary package.json files
    const [rootPackageJson, infraPackageJson] = await Promise.all([
      fs
        .readFile(path.resolve(__dirname, "..", "package.json"), "utf8")
        .then(JSON.parse),
      fs
        .readFile(
          path.resolve(
            __dirname,
            "..",
            "..",
            "..",
            "packages",
            "infrastructure",
            "package.json"
          ),
          "utf8"
        )
        .then(JSON.parse),
    ]);

    // Create base config with combined dependencies
    const baseConfig = {
      name: "@lab-tutorial/backend-handlers",
      version: "1.0.0",
      private: true,
      type: "module",
      dependencies: {
        // Include all AWS SDK and other dependencies
        ...rootPackageJson.dependencies,
        // Include infrastructure dependencies directly
        ...infraPackageJson.dependencies,
        // Remove the infrastructure package reference
        "@lab-tutorial/infrastructure": undefined,
      },
    };

    // Inject files for handlers
    const handlersConfig = {
      ...baseConfig,
      name: "@lab-tutorial/backend-handlers",
    };
    await injectFiles("dist/handlers", handlersConfig);

    // Inject files for agents
    const agentsConfig = {
      ...baseConfig,
      name: "@lab-tutorial/backend-agents",
    };
    await injectFiles("dist/agents", agentsConfig);

    console.log("✓ Successfully injected package.json and related files");
  } catch (error) {
    console.error("Error injecting files:", error);
    process.exit(1);
  }
}

injectPackageJson().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
