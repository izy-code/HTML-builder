const { createReadStream, createWriteStream } = require('fs');
const { resolve, parse } = require('path');
const { readdir } = require('fs/promises');
const { pipeline } = require('stream/promises');

const BUNDLE_PATH = 'project-dist/bundle.css';
const STYLES_PATH = 'test-files/styles';

const bundlePath = resolve(__dirname, BUNDLE_PATH);
const stylesPath = resolve(__dirname, STYLES_PATH);

const bundleStyles = async () => {
  try {
    const writeStream = createWriteStream(bundlePath);
    const direntObjects = await readdir(stylesPath, { withFileTypes: true });

    for (const direntObject of direntObjects) {
      const name = direntObject.name;
      const path = resolve(stylesPath, name);
      const parsedPath = parse(path);
      const fileExt = parsedPath.ext.slice(1).toLowerCase();

      if (direntObject.isFile() && fileExt === 'css') {
        const readStream = createReadStream(path, 'utf-8');

        readStream.on('end', () => {
          writeStream.write('\n');
        });

        await pipeline(readStream, writeStream, { end: false });
      }
    }
  } catch (error) {
    console.error(error.message);
  }
};

bundleStyles();
