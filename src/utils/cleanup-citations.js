import { promises as fs } from 'fs';
import path from 'path';

// Script to remove all citation files from the project
const cleanupCitations = async () => {
  const citationPatterns = [
    '*Citations.md',
    'Code Citations.md',
    'Code_Citations.md',
    '# Code Citations.md'
  ];
  
  const projectRoot = process.cwd();
  
  const findAndDeleteFiles = async (dir, patterns) => {
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
          await findAndDeleteFiles(fullPath, patterns);
        } else if (file.isFile()) {
          for (const pattern of patterns) {
            if (file.name.match(pattern.replace('*', '.*'))) {
              console.log(`Deleting: ${fullPath}`);
              await fs.unlink(fullPath);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${dir}:`, error);
    }
  };
  
  await findAndDeleteFiles(projectRoot, citationPatterns);
  console.log('Citation cleanup complete!');
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupCitations();
}

export default cleanupCitations;
