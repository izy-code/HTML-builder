const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { stdin, stdout, exit } = require('process');

const TEXT_FILE_NAME = 'text.txt';
const EXIT_KEYWORD = 'exit';

const textFilePath = path.resolve(__dirname, TEXT_FILE_NAME);
const input = readline.createInterface(stdin);
const output = fs.createWriteStream(textFilePath);

const terminateProcess = () => {
  stdout.write('\nProgram execution completed.');
  exit();
};

fs.writeFile(textFilePath, '', (err) => {
  if (err) throw err;

  stdout.write('Please enter the text you want to write to the text file:\n');
});

input.on('line', (lineInput) => {
  lineInput === EXIT_KEYWORD
    ? terminateProcess()
    : output.write(`${lineInput}\n`);
});

process.on('SIGINT', () => terminateProcess());
