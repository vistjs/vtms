import Iron from '@hapi/iron';

export async function createLoginSession(session, secret) {
  const createdAt = Date.now();
  const obj = { ...session, createdAt };
  console.log('session in createLoginSession:', session);
  const token = await Iron.seal(obj, secret, Iron.defaults);

  return token;
}

export async function getLoginSession(token, secret) {
  const session = await Iron.unseal(token, secret, Iron.defaults);
  const expiresAt = session.createdAt + session.maxAge * 1000;

  // Validate the expiration date of the session
  if (session.maxAge && Date.now() > expiresAt) {
    throw new Error('Session expired');
  }

  return session;
}
