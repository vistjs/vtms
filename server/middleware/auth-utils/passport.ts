import passport from 'passport';
import LocalStrategy from 'passport-local';
import { findUserByUsername, validatePassword } from './db';

passport.serializeUser(function (user, done) {
  // serialize the username into session
  console.log('user::', user);
  done(null, user.username);
});

passport.deserializeUser(function (req, id, done) {
  // deserialize the username back into user object
  const user = findUserByUsername(req, id);
  done(null, user);
});

passport.use(
  new LocalStrategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
      // Here you lookup the user in your DB and compare the password/hashed password
      console.log('username in passport:', username);
      const user = await findUserByUsername(req, username);
      console.log('user in passport:', user);
      // Security-wise, if you hashed the password earlier, you must verify it
      // if (!user || await argon2.verify(user.password, password))
      if (!user || !validatePassword(user, password)) {
        console.log('req req in passport 111:', req.session);
        done(null, null);
      } else {
        console.log('req req in passport 222:', req.session);
        done(null, user);
      }
    },
  ),
);

export default passport;
