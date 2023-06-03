
import { format as f } from 'util';
import { createServer as createHttpServer } from 'http';

export const server = createHttpServer((req, res) => {
  console.log(f('Connection from %s:%s %s "%s"', req.socket.remoteAddress, req.socket.remotePort, req.method, req.url));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
  JSON.stringify({
    data: 'It Works',
  })
  );
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server running on http://localhost:3000/');
});
