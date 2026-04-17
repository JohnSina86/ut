import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { OAuthService } from '../modules/auth/oauth.service.js';

const oauthService = new OAuthService();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.API_URL || 'http://localhost:4000'}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'), undefined);

        const result = await oauthService.findOrCreateFromOAuth({
          provider: 'google',
          providerId: profile.id,
          email,
          name: profile.displayName || email.split('@')[0],
          avatar: profile.photos?.[0]?.value,
        });

        return done(null, result as any);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

export default passport;
