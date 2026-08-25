import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';

const archive = '/home/ubuntu/resto-commerce-theme/wordpress-archives/restocommerce-theme.zip';
const server = createServer((request, response) => {
  if (request.url !== '/restocommerce-theme.zip') {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
    'Content-Length': statSync(archive).size,
    'Content-Type': 'application/zip',
  });
  createReadStream(archive).pipe(response);
});

server.listen(4173, '0.0.0.0');
