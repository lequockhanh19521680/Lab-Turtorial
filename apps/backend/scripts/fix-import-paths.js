import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixImportPaths() {
  try {
    const handlersDir = path.resolve(__dirname, '..', 'dist', 'handlers');
    const utilsDir = path.resolve(__dirname, '..', 'dist', 'utils');
    
    // Fix imports in handlers
    console.log('Fixing imports in handlers...');
    const handlerFiles = await fs.readdir(handlersDir);
    
    for (const file of handlerFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(handlersDir, file);
        let content = await fs.readFile(filePath, 'utf8');
        
        // Replace ../utils/ with ./utils/ in import statements
        content = content.replace(
          /from ["']\.\.\/utils\/([^"']+)["']/g,
          'from "./utils/$1"'
        );
        
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`✓ Fixed import paths in handlers/${file}`);
      }
    }
    
    // Fix imports in utils files (for imports between utils)
    console.log('Fixing imports in utils...');
    const utilFiles = await fs.readdir(utilsDir);
    
    for (const file of utilFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(utilsDir, file);
        let content = await fs.readFile(filePath, 'utf8');
        
        // Add .js extension to relative imports (e.g., './lambda' -> './lambda.js')
        content = content.replace(
          /from ["'](\.[^"']*[^\.][^j][^s])["']/g,
          'from "$1.js"'
        );
        
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`✓ Fixed import paths in utils/${file}`);
      }
    }
    
    console.log('✓ All import paths fixed');
  } catch (error) {
    console.error('Error fixing import paths:', error);
    process.exit(1);
  }
}

fixImportPaths().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});