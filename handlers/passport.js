const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const facebookStrategy = require('passport-facebook').Strategy;
const secret = require('./secret');


passport.use(User.createStrategy());

passport.use(new facebookStrategy(secret.facebook, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
        User.findOne({
            $or: [{
                'facebook.id': profile.id
            },
            {
                'email': profile.emails[0].value
            }
            ]
        }, (err, user) => {
            if (err) return done(err);

            if (user) {
                if (user.facebook.id == undefined) {
                    user.facebook.id = profile.id;
                    user.facebook.token = accessToken;
                    user.facebook.email = profile.emails[0].value;
                    user.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`;
                    user.slika = `https://graph.facebook.com/${profile.id}/picture?type=large`;
                    user.save();

                }
                return done(null, user);
            } else {
                const newUser = new User();
                newUser.facebook.id = profile.id;
                newUser.facebook.token = accessToken;
                newUser.facebook.email = profile.emails[0].value;
                newUser.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`;
                newUser.email = profile._json.email;

                newUser.ime = `${profile.name.givenName} ${profile.name.familyName}`;
                newUser.slika = `https://graph.facebook.com/${profile.id}/picture?type=large`;

                newUser.save((err) => {
                    if (err) throw err;
                    return done(null, newUser);
                });
            }
        });
    });
}))


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());