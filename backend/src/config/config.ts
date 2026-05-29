import crypto from 'crypto';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET env var must be set and at least 32 characters in production');
  }
  console.warn('WARNING: JWT_SECRET is weak or unset. Set a strong secret in .env for production.');
}

export default {
  jwtSecret: jwtSecret || crypto.randomBytes(32).toString('hex'),
  bcryptRounds: 12,
};
