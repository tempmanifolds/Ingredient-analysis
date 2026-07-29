import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'dist');
const files = ['index.html', 'about.html', '404.html', 'robots.txt', '.nojekyll'];
const directories = ['css', 'js', 'data'];

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(sourcePath, destinationPath);
    else fs.copyFileSync(sourcePath, destinationPath);
  }
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
for (const directory of directories) {
  copyDirectory(path.join(root, directory), path.join(output, directory));
}

console.log('GitHub Pages 发布目录已生成：dist/');
