
import * as http from 'http';

export const server = http.createServer((req, res) => {
  console.log('Connection from ' + req.socket.remoteAddress + ':' + req.socket.remotePort + ' ' + req.method + ' ' + req.url);
  // console.log('req', req);
  // console.log('res', res);

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
