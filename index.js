import http from 'http';
import path from 'path';
import fs from 'fs';

const folder = '.';
const allowedHeaders = ['Authorization', 'Content-Type', 'x-api-key'];
const sendFile = (request, response) => {
  let parsedUrl = new URL(request.url, 'http://localhost:4000');
  let fileName = parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname;
  let filePath = path.join(folder, fileName);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(folder, 'index.html');
  }
  let stat = fs.statSync(filePath);
  let fExtention = path.extname(filePath);
  let contentType = 'text/html';
  switch (fExtention) {
    case '.css':
      contentType = 'text/css';
      break;
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
    case '.html':
      contentType = 'text/html';
      break;
    case '.icon':
      contentType = 'image/x-icon';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    default:
      break;
  }
  response.setHeader('Access-Control-Allow-Origin', request.headers.origin || '*');
  response.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(','));
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH, OPTIONS');
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size
  });
  let stream = fs.createReadStream(filePath);
  stream.pipe(response);
  return;
};


http.createServer(sendFile).listen(4000, () => {
  console.log('Server is running on port 4000');
});