const { resolve } = require('path');
const { readdir, mkdir, rm, copyFile } = require('fs/promises');

const FOLDER_NAME = 'files';

const copiedFolderName = `${FOLDER_NAME}-copy`;
const folderPath = resolve(__dirname, FOLDER_NAME);
const copyPath = resolve(__dirname, copiedFolderName);

const copyFilesInFolder = async () => {
  try {
    const direntObjects = await readdir(folderPath, { withFileTypes: true });

    await rm(copyPath, { recursive: true, force: true });
    await mkdir(copyPath, { recursive: true });

    for (const direntObject of direntObjects) {
      const name = direntObject.name;
      const source = resolve(folderPath, name);
      const dest = resolve(copyPath, name);

      await copyFile(source, dest);
    }
  } catch (error) {
    console.error(error.message);
  }
};

copyFilesInFolder();
