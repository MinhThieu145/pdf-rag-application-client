const https = require('https');
const fs = require('fs');
const path = require('path');

const version = require('pdfjs-dist/package.json').version;
const workerUrl = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`;
const outputPath = path.join(__dirname, '..', 'public', 'pdf.worker.min.js');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Download the worker file
https.get(workerUrl, (response) => {
  const file = fs.createWriteStream(outputPath);
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('PDF worker file downloaded successfully!');
  });
}).on('error', (err) => {
  console.error('Error downloading PDF worker file:', err);
});
