import nextConnect from 'next-connect';
// import passport from '../lib/passport'
// import session from '../lib/session'

const auth = nextConnect().use((req, res, next) => {
  // Initialize mocked database
  // Remove this after you add your own database
  // req.session.users = req.session.users || []
  req.headers.cookie += 'fff777';

  //TODO：处理登录鉴权
  console.log('req.headers.cookie 333:', req.headers.cookie);
  next();
});

export default auth;
