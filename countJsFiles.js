const fs = require('fs');
const path = require('path');

// Function to count .js and .jsx files recursively
const countJsFiles = (dirPath) => {
  let count = 0;
  const jsFiles = [];

  const readDirectory = (currentPath) => {
    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Exclude node_modules and .next directories
        if (file !== 'node_modules' && file !== '.next') {
          readDirectory(fullPath);
        }
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        count++;
        jsFiles.push(fullPath);
      }
    });
  };

  readDirectory(dirPath);
  return { count, jsFiles };
};

// Get the current working directory
const currentDirectory = process.cwd();

// Count .js and .jsx files in the current directory and its subdirectories
const { count, jsFiles } = countJsFiles(currentDirectory);

// Display the count and file paths
console.log(`Number of .js and .jsx files: ${count}`);
jsFiles.forEach(file => console.log(file));
