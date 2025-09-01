import fs from "fs-extra";
import path from "path";

async function copyPackageFiles() {
  const directories = ["handlers", "agents"];
  const mainPackage = JSON.parse(await fs.readFile("package.json", "utf8"));

  // Create minimal package.json for Lambda functions
  const lambdaPackage = {
    type: "module",
    main: "index.js",
  };

  for (const dir of directories) {
    const distDir = path.join("dist", dir);
    const files = await fs.readdir(distDir);

    // Create a package.json for each handler directory
    for (const file of files) {
      if (file.endsWith(".js") && !file.includes(".test.")) {
        const handlerDir = path.join(distDir, path.parse(file).name);
        await fs.ensureDir(handlerDir);
        await fs.copy(
          path.join(distDir, file),
          path.join(handlerDir, "index.js")
        );
        await fs.writeJSON(
          path.join(handlerDir, "package.json"),
          lambdaPackage,
          { spaces: 2 }
        );
      }
    }
  }
}

copyPackageFiles().catch(console.error);
