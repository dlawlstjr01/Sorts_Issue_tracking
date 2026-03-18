const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const KakaoStrategy = require("passport-kakao").Strategy;

module.exports = function initPassport() {
  // 구글
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // profile에서 필요한 값 뽑기
          const sns_id = profile.id;
          const sns_email =
            profile.emails && profile.emails[0] ? profile.emails[0].value : null;

          return done(null, {
            provider: "google",
            sns_id,
            sns_email,
          });
        } catch (e) {
          return done(e);
        }
      }
    )
  );
  // 카카오
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_CLIENT_ID,
        callbackURL: process.env.KAKAO_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const provider = "kakao";
          const sns_id = String(profile.id);

          // 카카오는 이메일이 없을 수 있음 (동의/계정설정)
          const kakaoAccount = profile._json?.kakao_account;
          const sns_email = kakaoAccount?.email || null;

          return done(null, { provider, sns_id, sns_email });
        } catch (e) {
          return done(e);
        }
      }
    )
  );
};
