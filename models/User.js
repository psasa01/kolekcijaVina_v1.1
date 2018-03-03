const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    ime: {
        type: String,
        required: 'Molimo unesite korisničko ime',
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: 'Molimo unesite validan email',
        lowercase: true,
        trim: true,
        validate: [
            validator.isEmail,
            'Nažalost niste unijeli validnu email adresu!'
        ]
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        ime: String
    },
    slika: {
        type: String,
        default: ''
    },
    level: {
        type: Number,
        default: 30
    },
    brojVina: {
        type: Number,
        default: 0
    },
    registrovan: {
        type: Date,
        default: Date.now()
    },
    secretToken: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
        default: ''
    },
    resetPasswordExpire: {
        type: Date,
        default: undefined
    }
});

userSchema.virtual('gravatar').get(function () {
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=150`;
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);