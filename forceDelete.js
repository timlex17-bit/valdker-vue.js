// forceDelete.js
import fs from 'fs';
import path from 'path';

const targetPath = path.resolve('dist/win-unpacked');

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach(file => {
      const curPath = path.join(folderPath, file);
      try {
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      } catch (e) {
        console.warn('Failed to delete:', curPath, e.code);
      }
    });
    try {
      fs.rmdirSync(folderPath);
    } catch (e) {
      console.warn('Failed to remove folder:', folderPath, e.code);
    }
  }
}

deleteFolderRecursive(targetPath);
