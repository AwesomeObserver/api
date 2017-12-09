import * as fs from 'fs';
import * as path from 'path';

export function getFolderData(folderPath) {
  if (!fs.existsSync(folderPath)) {
    return {};
  }

  const files = fs.readdirSync(folderPath, 'utf-8');
  let data = {};
  
  files.forEach(fileName => {
    const fullFileName = `${folderPath}${fileName}`;
    const { ext, name } = path.parse(fullFileName);
    
    if (ext === '.ts' || ext === '.js') {
      data[name] = require(fullFileName);
    } else if (ext === '') {
      const folderData = getFolderData(`${folderPath}${name}/`);
      data = { ...data, ...folderData };
    }
  });

  return data;
}