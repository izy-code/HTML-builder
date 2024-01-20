const { resolve, parse } = require('path');
const { readdir, stat } = require('fs/promises');

const FOLDER_NAME = 'secret-folder';

const folderPath = resolve(__dirname, FOLDER_NAME);

const displayFilesData = async () => {
  try {
    const names = await readdir(folderPath);

    for (const name of names) {
      const path = resolve(folderPath, name);
      const stats = await stat(path);

      if (!stats.isFile()) continue;

      const parsedPath = parse(path);
      const fileExt = parsedPath.ext.slice(1);

      console.log(`${parsedPath.name} - ${fileExt} - ${stats.size} bytes`);
    }
  } catch (error) {
    console.error(error.message);
  }
};

displayFilesData();
