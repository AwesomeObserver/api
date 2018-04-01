import * as crypto from 'crypto';

export const instanceId = crypto.randomBytes(4).toString('hex');
