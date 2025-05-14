#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to remove .ts extensions from import statements
function removeExtensions(content) {
  // Regex pattern for import statements with .ts extension
  const importRegex = /(from\s+["'])([^"']+)\.ts(["'])/g;
  return content.replace(importRegex, '$1$2$3');
}

// Function to process a file
function processFile(filePath) {
  if (!filePath.endsWith('.ts')) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const modifiedContent = removeExtensions(content);
    
    if (content !== modifiedContent) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`Updated imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Function to walk through a directory recursively
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else {
      processFile(filePath);
    }
  });
}

// Start the process with src directory
const srcDir = path.join(__dirname, 'src');
walkDir(srcDir);

console.log('Import transformation complete!');
