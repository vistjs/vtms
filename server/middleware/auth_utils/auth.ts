import Iron from '@hapi/iron';
import crypto from 'crypto';
// import { v4 as uuidv4 } from 'uuid';

import { AUTH_ERROR } from '@/constant/index';

export async function createLoginSession(session, secret) {
  const createdAt = Date.now();
  const obj = { ...session, createdAt };
  const token = await Iron.seal(obj, secret, Iron.defaults);

  return token;
}

export async function getLoginSession(token, secret) {
  const session = await Iron.unseal(token, secret, Iron.defaults);
  const expiresAt = session.createdAt + session.maxAge * 1000;

  // Validate the expiration date of the session
  if (session.maxAge && Date.now() > expiresAt) {
    throw new Error(AUTH_ERROR.SESSION_EXPIRED);
  }

  return session;
}

export function createUserSaltHash(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return { salt, hash };
}

export function createUser({ username, password, name }) {
  // Here you should create the user and save the salt and hashed password (some dbs may have
  // authentication methods that will do it for you so you don't have to worry about it):
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  const user = {
    // createdAt: Date.now(),
    username,
    name,
    ...createUserSaltHash(password),
  };
  return user;
}

export function validatePassword(user, inputPassword: string) {
  const inputHash = crypto
    .pbkdf2Sync(inputPassword, user.salt, 1000, 64, 'sha512')
    .toString('hex');
  const passwordsMatch = user.hash === inputHash;
  return passwordsMatch;
}
