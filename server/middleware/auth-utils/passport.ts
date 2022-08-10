import passport from 'passport';
import LocalStrategy from 'passport-local';

import conn from '@/lib/mongoose';
import UserModel from '@/models/user';

import { validatePassword } from './auth';

passport.serializeUser(function (user, done) {
  // serialize the username into session
  console.log('user in serializeUser:', user);
  done(null, user.username);
});

passport.deserializeUser(async function (req, username, done) {
  // deserialize the username back into user object
  const user = await UserModel.findOne({ username }).exec();
  console.log('user in deserializeUser:', user);
  done(null, user);
});

passport.use(
  // 登录接口调用时执行的中间件
  new LocalStrategy(
    { passReqToCallback: true },
    async (req, username: string, password: string, done) => {
      await conn();
      const user = await UserModel.findOne({ username }).exec();

      console.log('user in db:', user);

      if (!user || !validatePassword(user, password)) {
        // 此时中间件会自动res返回
        done(null, null);
      } else {
        done(null, user);
      }
    },
  ),
);

export default passport;
