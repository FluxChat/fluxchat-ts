
import { createServer, Socket } from 'net';

(() => {
  const server = createServer();
  // const server = createServer((socket: Socket) => {
  //   console.log('A Connection from ' + socket.remoteAddress);
  //   socket.write('Hello World\n');
  //   // socket.end('Goodbye\n');
  // });
  server.listen(4000, '127.0.0.1', () => {
      console.log('Server listening to %j', server.address());
  });
  server.on('connection', (socket: Socket) => {
    console.log('B Connection from ' + socket.remoteAddress);
    socket.end('Hello World\n');
  });
})();
