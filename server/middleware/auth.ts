import nextConnect from 'next-connect';
import passport from './auth-utils/passport';
import session from './auth-utils/session';

console.log('process.env.TOKEN_SECRET:', process.env.TOKEN_SECRET);

const auth = nextConnect()
  .use(
    session({
      name: 'codeless-sso',
      secret: 'token_secret_1#$&,ggfjsfk_12_86_093_fjslkfrjkfjslfkjfs',
      cookie: {
        maxAge: 60 * 60 * 8, // 8 hours,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      },
    }),
  )
  .use((req, res, next) => {
    // Initialize mocked database
    // Remove this after you add your own database
    // req.session.users = req.session.users || [];
    console.log('req.session:::', req.session);
    next();
  })
  .use(passport.initialize())
  .use(passport.session());

export default auth;
