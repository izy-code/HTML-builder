const fs = require('fs');
const path = require('path');
const { stdout } = require('process');

const TEXT_FILE_NAME = 'text.txt';

const textFilePath = path.resolve(__dirname, TEXT_FILE_NAME);
const stream = fs.createReadStream(textFilePath, 'utf-8');

stream.on('data', (chunk) => stdout.write(chunk));
stream.on('error', (error) => stdout.write(`Stream error. ${error.message}`));
