import path from 'path';
import fs from 'fs/promises';

// Read list of folders from p-apps directory
async function getPApps() {
  const pAppsDir = path.join(process.cwd(), 'p-apps');
  const entries = await fs.readdir(pAppsDir, { withFileTypes: true });
  const folders = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
  return folders;
}

console.log('Parsing p-apps directory...');
const pApps = await getPApps();
console.log('Found p-apps:', pApps);

let fileSystem = [];
/**
 * 
 * "id": "root-1",
    "name": "index.html",
    "type": "file",
    "parentId": null,
    "children": []
 */
// Loop through each folder and read html files
for (const folder of pApps) {
  const folderPath = path.join(process.cwd(), 'p-apps', folder);
  const files = await fs.readdir(folderPath);
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  let children = htmlFiles.map(file => ({
    id: `file-${folder}-${file}`,
    name: file,
    type: 'file',
    parentId: `root-${folder}`,
    path: `./${folder}/${file}`
  }));
  fileSystem.push({
    id: `root-${folder}`,
    name: folder,
    type: 'folder',
    parentId: null,
    path: `/${folder}`,
    children: children
  });
}

await fs.writeFile(path.join(process.cwd(), 'p-apps', 'file-structure.json'), JSON.stringify(fileSystem, null, 2));
console.log('Constructed file system:', JSON.stringify(fileSystem, null, 2));