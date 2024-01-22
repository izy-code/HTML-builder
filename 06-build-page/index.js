const { createReadStream, createWriteStream } = require('fs');
const { writeFile, mkdir, readdir, copyFile, rm } = require('fs/promises');
const { resolve, basename, dirname, parse } = require('path');
const { Readable } = require('stream');
const { finished: streamFinished, pipeline } = require('stream/promises');

const distPath = resolve(__dirname, 'project-dist');
const componentsPath = resolve(__dirname, 'components');
const stylesPath = resolve(__dirname, 'styles');
const assetsPath = resolve(__dirname, 'assets');
const assetsCopyPath = resolve(distPath, 'assets');
const templateFilePath = resolve(__dirname, 'template.html');
const resolvedFilePath = resolve(distPath, 'index.html');
const bundleFilePath = resolve(distPath, 'style.css');

const getDataFromFile = async (filePath) => {
  const readStream = createReadStream(filePath, 'utf-8');
  let data = '';

  readStream.on('data', (chunk) => (data += chunk));
  await streamFinished(readStream);

  return data;
};

const writeDataToFile = async (data, filePath) => {
  try {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, '');

    const input = Readable.from(data);
    const output = createWriteStream(filePath, 'utf-8');

    input.on('data', (chunk) => output.write(chunk));

    await streamFinished(input);
  } catch (error) {
    console.error(`Error writing to ${basename(filePath)}\n`, error.message);
  }
};

const getResolvedTemplateData = async (
  templateData,
  componentsPath,
  componentExt,
) => {
  try {
    const templateTags = [];
    const templateTagRegex = /{{([^}]+)}}/g;

    let result = templateData;
    let match;

    while ((match = templateTagRegex.exec(templateData)) !== null) {
      templateTags.push(match[1]);
    }

    for (const templateTag of templateTags) {
      const componentFilePath = resolve(
        componentsPath,
        `${templateTag}.${componentExt}`,
      );

      try {
        const componentData = await getDataFromFile(componentFilePath);
        const formattedData = componentData.replace(/\n$/, '');

        result = result.replaceAll(`{{${templateTag}}}`, formattedData);
      } catch (error) {
        console.log(`Can't find "${basename(componentFilePath)}" component`);
      }
    }

    return result;
  } catch (error) {
    console.error('Error resolving template data\n', error.message);
  }
};

const bundleFiles = async (bundlePath, componentsPath, componentExt) => {
  try {
    const writeStream = createWriteStream(bundlePath);
    const dirEntities = await readdir(componentsPath, { withFileTypes: true });

    for (const dirEntity of dirEntities) {
      const name = dirEntity.name;
      const path = resolve(componentsPath, name);
      const parsedPath = parse(path);
      const fileExt = parsedPath.ext.slice(1).toLowerCase();

      if (dirEntity.isFile() && fileExt === componentExt) {
        const readStream = createReadStream(path, 'utf-8');

        readStream.on('end', () => writeStream.write('\n'));

        await pipeline(readStream, writeStream, { end: false });
      }
    }

    writeStream.close();
  } catch (error) {
    console.error(`Error bundling to ${basename(bundlePath)}\n`, error.message);
  }
};

const copyDirectory = async (sourcePath, destinationPath) => {
  try {
    const dirEntities = await readdir(sourcePath, { withFileTypes: true });

    await rm(destinationPath, { recursive: true, force: true });
    await mkdir(destinationPath, { recursive: true });

    for (const dirEntity of dirEntities) {
      const name = dirEntity.name;
      const source = resolve(sourcePath, name);
      const dest = resolve(destinationPath, name);

      if (dirEntity.isFile()) {
        await copyFile(source, dest);
      } else if (dirEntity.isDirectory()) {
        copyDirectory(source, dest);
      }
    }
  } catch (error) {
    console.error(`Error copying ${sourcePath}\n`, error.message);
  }
};

const main = async () => {
  try {
    const templateData = await getDataFromFile(templateFilePath);
    const resolvedData = await getResolvedTemplateData(
      templateData,
      componentsPath,
      'html',
    );

    await rm(distPath, { recursive: true, force: true });
    await mkdir(distPath, { recursive: true });
    await writeDataToFile(resolvedData, resolvedFilePath);
    await bundleFiles(bundleFilePath, stylesPath, 'css');
    await copyDirectory(assetsPath, assetsCopyPath);
  } catch (error) {
    console.error(error.message);
  }
};

main();
