import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(`import.meta.url: ${import.meta.url}`);
console.log(`__dirname: ${__dirname}`);
