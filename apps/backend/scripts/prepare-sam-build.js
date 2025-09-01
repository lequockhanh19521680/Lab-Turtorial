import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clean up .aws-sam if it exists
const samBuildDir = path.join(__dirname, "..", ".aws-sam");
if (fs.existsSync(samBuildDir)) {
  try {
    // Attempt to change permissions before removal
    const files = fs.readdirSync(samBuildDir, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(samBuildDir, file.name);
      try {
        fs.chmodSync(filePath, 0o777);
        if (file.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.warn(`Warning: Could not remove ${filePath}: ${error.message}`);
      }
    }
    fs.rmdirSync(samBuildDir);
  } catch (error) {
    console.warn(
      `Warning: Could not fully clean up ${samBuildDir}: ${error.message}`
    );
  }
}

// Handle node_modules permissions
const handlersDir = path.join(__dirname, "..", "dist", "handlers");
const agentsDir = path.join(__dirname, "..", "dist", "agents");

function ensureDirectoryPermissions(dir) {
  if (fs.existsSync(dir)) {
    // Ensure the directory and all its contents are writable
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      try {
        fs.chmodSync(filePath, 0o777);
        if (file.isDirectory()) {
          ensureDirectoryPermissions(filePath);
        }
      } catch (error) {
        console.warn(
          `Warning: Could not set permissions for ${filePath}: ${error.message}`
        );
      }
    }
  }
}

// Copy utils directory to the right location for handlers and agents
function copyUtils(targetDir) {
  const utilsSrc = path.join(__dirname, "..", "dist", "utils");
  const utilsDest = path.join(targetDir, "utils");

  if (fs.existsSync(utilsSrc)) {
    if (!fs.existsSync(utilsDest)) {
      fs.mkdirSync(utilsDest, { recursive: true });
    }
    fs.cpSync(utilsSrc, utilsDest, {
      recursive: true,
      force: true,
    });
  }
}

// Function to copy utils directory to SAM build directory
async function copySAMUtils(functionName) {
  const utilsSrc = path.join(__dirname, "..", "dist", "utils");
  const samBuildPath = path.join(
    __dirname,
    "..",
    ".aws-sam",
    "build",
    functionName
  );

  if (fs.existsSync(utilsSrc) && fs.existsSync(samBuildPath)) {
    const utilsDest = path.join(samBuildPath, "utils");
    if (!fs.existsSync(utilsDest)) {
      fs.mkdirSync(utilsDest, { recursive: true });
    }
    fs.cpSync(utilsSrc, utilsDest, {
      recursive: true,
      force: true,
    });
    console.log(`✓ Copied utils to ${functionName}`);
  }
}

// Set permissions for handlers and agents directories and copy utils
[handlersDir, agentsDir].forEach((dir) => {
  // Handle node_modules permissions
  const nodeModulesDir = path.join(dir, "node_modules");
  if (fs.existsSync(nodeModulesDir)) {
    ensureDirectoryPermissions(nodeModulesDir);
  }

  // Copy utils directory
  copyUtils(dir);
});

// Copy utils to SAM build directories for each Lambda function
const functionNames = [
  "ProjectsFunction",
  "AgentWorkerFunction",
  "OrchestratorFunction",
  "NotificationHandlerFunction",
];
functionNames.forEach((functionName) => {
  copySAMUtils(functionName);
});
