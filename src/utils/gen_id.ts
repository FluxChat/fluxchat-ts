
const minimist = require('minimist');
import * as fs from 'fs';
import { generateIdFromPublicKeyFile } from '../lib/helpers';

const options = {
  string: ['public-key-file'],
  alias: {
    'public-key-file': ['f'],
  },
  default: {
    'public-key-file': 'var/data1/public_key.pem',
  },
};
const args = minimist(process.argv.slice(2), options);

// console.warn(args);
console.log(generateIdFromPublicKeyFile(args['public-key-file']));
