
import { passwordKeyDerivation } from '../lib/helpers';

const password = process.env.FLUXCHAT_KEY_PASSWORD || 'password';
console.log(passwordKeyDerivation(password));
