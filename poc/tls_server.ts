
import * as tls from 'tls';
import * as fs from 'fs';

const PORT = 4000;
const HOST = '127.0.0.1';

const options = {
  // sessionTimeout: 10,
  key: [{
    pem: fs.readFileSync('var/data1/private_key.pem'),
    passphrase: process.env.FLUXCHAT_KEY_PASSWORD || 'password',
  }],
  cert: fs.readFileSync('var/data1/certificate.pem'),
};
const server = tls.createServer(options, (socket) => {
  // Send a friendly message
  socket.write('I am the server sending you a message.');

  // Print the data that we received
  socket.on('data', (data) => {
    console.log('Received: %s [it is %d bytes long]', data.toString().replace(/(\n)/gm,""),data.length);
  });

  // Let us know when the transmission is over
  socket.on('end', () => {
    console.log('EOT (End Of Transmission)');
  });
});

// Start listening on a specific port and address
server.listen(PORT, HOST, () => {
  console.log("I'm listening at %s, on port %s", HOST, PORT);
});

// When an error occurs, show it.
server.on('error', (error) => {
  console.error(error);

  // Close the connection after the error occurred.
  server.close();
});
