
import { connect } from 'tls';
import { readFileSync } from 'fs';

(() => {
  const HOST = '127.0.0.1';
  const PORT = 25001;

  // Pass the certs to the server and let it know to process even unauthorized certs.
  const options = {
    host: HOST,
    port: PORT,
    key: [{
      pem: readFileSync('var/data2/private_key.pem'),
      passphrase: process.env.FLUXCHAT_KEY_PASSWORD || 'password',
    }],
    cert: readFileSync('var/data2/certificate.pem'),
    rejectUnauthorized: false,
  };
  const client = connect(options, () => {
    // Check if the authorization worked
    if (client.authorized) {
      console.log('Connection authorized by a Certificate Authority.');
    } else {
      console.log('Connection not authorized: ' + client.authorizationError)
    }

    // Send a friendly message
    client.write('I am the client sending you a message.');
  });

  client.on('data', (data) => {
    console.log('Received: %s [it is %d bytes long]',
      data.toString().replace(/(\n)/gm, ''),
      data.length);

    // Close the connection after receiving the message
    client.end();
  });

  client.on('close', () => {
    console.log('Connection closed');
  });

  // When an error ocoures, show it.
  client.on('error', (error) => {
    console.error(error);

    // Close the connection after the error occurred.
    client.destroy();
  });
})();
