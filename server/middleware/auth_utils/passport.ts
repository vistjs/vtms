import passport from 'passport';
import LocalStrategy from 'passport-local';

import conn from '@/lib/mongoose';
import UserModel from '@/models/user';
import RoleModel, { IRole } from '@/models/role';
import { addRoleNameToUser } from '@/utils';

import { validatePassword } from './auth';

passport.serializeUser(function (user, done) {
  // serialize the username into req.session
  console.log('user in serializeUser:', user);
  done(null, user.username);
});

passport.deserializeUser(async function (req, username, done) {
  // deserialize the username back into user object
  const [rawUser, roles] = await Promise.all([
    UserModel.findOne({ username }).exec(),
    RoleModel.find().lean(),
  ]);
  let user = addRoleNameToUser([rawUser.toObject()], roles as IRole[])?.[0];
  done(null, user);
});

passport.use(
  // 登录接口调用时执行的中间件
  new LocalStrategy(
    { passReqToCallback: true },
    async (req, username: string, password: string, done) => {
      await conn();
      const user = await UserModel.findOne({ username }).exec();

      if (!user || !validatePassword(user, password)) {
        // done 回调的参数会传递到/login/account接口中间件中
        done(null, null, {
          message: !user ? 'username does not exist.' : 'password error',
        });
      } else {
        done(null, user);
      }
    },
  ),
);

export default passport;
