import fs from 'fs';
import path from 'path';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We only want to replace <img if it doesn't already have loading="lazy"
      // Simplest way: just replace '<img ' with '<img loading="lazy" ' 
      // But let's avoid double adding if we run it twice.
      content = content.replace(/<img(?!\s+loading="lazy")\s+/g, '<img loading="lazy" ');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDirectory('./src');
console.log('Lazy loading añadido a todas las imágenes.');
