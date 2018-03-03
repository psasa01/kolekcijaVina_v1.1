const mongoose = require('mongoose');
const User = mongoose.model('User');
const Vino = mongoose.model('Vino');
const promisify = require('es6-promisify');
const randomstring = require('randomstring');
const mailer = require('../handlers/mailer');
const passport = require('passport');


exports.login = (req, res) => {
    console.log(req.body);
    res.render('login', {
        title: 'Login',
        user: req.user,
        error: req.flash('Greška pri prijavljivanju!')
    });
};

exports.registerForm = (req, res) => {
    res.render('register', {
        title: 'Registracija'
    });
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'Morate unijeti korisničko ime!').notEmpty();
    req.checkBody('email', 'Email koji ste unijeli nažalost nije ispravan!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Morate unijeti šifru!').notEmpty();
    req.checkBody('password-potvrda', 'Morate potvrditi šifru!').notEmpty();
    req.checkBody('password-potvrda', 'Nažalost, šifre se ne podudaraju!').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', {
            title: 'Registracija',
            body: req.body,
            flashes: req.flash()
        });
        return; // stop
    }
    next(); // no errors
}

exports.register = async (req, res) => {
    const userFind = await User.findOne({
        email: req.body.email
    });
    if (userFind) {
        req.flash('error', 'Korisnik s navedenom email adresom već postoji!');
        res.redirect('/register');
    } else {

        // secret token
        const secretToken = randomstring.generate();
        const user = new User({
            email: req.body.email,
            ime: req.body.name,
            secretToken,
        });

        const html = `
            Poštovani,
            <br>
            zahvaljujemo Vam se na registraciji. Da biste aktivirali korisnički račun potrebno je da pratite link ispod, 
            te unesete aktivacijski kod!
            <br>
            Aktivacijski kod: 
            <br>
            <strong>${secretToken}</strong>
            <br>
            <a href="http://${req.headers.host}/aktivacija"> Aktiviraj korisnički račun </a>
            <br>
            <br>
            Zelimo Vam ugodan dan!`

        await mailer.sendEmail('admin@vina.sava.ba', user.email, 'Molimo Vas da verifikujete zahtjev za registraciju na vina.sava.ba', html);

        const register = promisify(User.register, User);
        await register(user, req.body.password);

        req.flash('success', 'Uspješno ste se registrovali. Ubrzo ćemo Vam poslati email sa aktivacijskim kodom.');
        res.redirect('login');
    }
};

exports.racun = (req, res) => {
    res.render('racun', {
        title: 'Uredi korisnički račun'
    });
};

exports.urediKorisnickiRacun = async (req, res) => {
    const updates = {
        ime: req.body.name,
        email: req.body.email
    };
    const user = await User.findOneAndUpdate({
        _id: req.user._id
    }, {
            $set: updates
        }, {
            new: true,
            runValidators: true,
            context: 'query'
        });
    req.flash('success', `Uspješno ste promjenili podatke za korisnika: ${user.ime}`);
    res.redirect('/');
};

exports.adminPanel = async (req, res) => {
    const korisnici = await User.find().sort([
        ['level', 'ascending']
    ]);



    res.render('admin', {
        title: 'Admin Panel',
        korisnici
    });
};

exports.oduzmiAdminPrava = async (req, res) => {
    const user = await User.findOneAndUpdate({
        _id: req.params.id
    }, {
            level: 30
        }, {
            new: true,
            runValidators: true
        });
    req.flash('success', `Uspješno ste oduzeli administratorska prava korisniku ${user.ime}`);
    res.redirect('back');
}

exports.dodijeliAdminPrava = async (req, res) => {
    const user = await User.findOneAndUpdate({
        _id: req.params.id
    }, {
            level: 10
        }, {
            new: true,
            runValidators: true
        });
    req.flash('success', `Uspješno ste dodjelili administratorska prava korisniku ${user.ime}`);
    res.redirect('back');
};

exports.uporediSifre = exports.confirmedPasswords = (req, res, next) => {
    if (req.body.password === req.body['password-potvrda']) {
        return next();
    } else {
        req.flash('error', 'Šifre se ne podudaraju');
        res.redirect('back');
    }
};

exports.reset = (req, res) => {
    res.render('reset', {
        title: 'Resetirajte korisničku šifru'
    });
};

exports.resetEmailForm = async (req, res) => {
    const user = await User.findOne({
        email: req.body.reset,
        active: true
    });



    if (!user) {
        req.flash('error', 'Korisnik ne postoji u bazi ili nije aktivan!. Molimo registrujte se ili aktivirajte račun.');
        res.redirect('/register')
    } else {

        const resetPasswordToken = randomstring.generate();
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 sat
        await user.save();

        const html = `
        Poštovani,
        <br>
        ovaj email je odgovor na Vaš zahtjev za promjenom šifre na stranici mojaKolekcijaVina. 
        <br>
        Da biste promjenili šifru pratite slijedeći link.
        <br>
        <br>
        <a href="http://${req.headers.host}/reset-pass/${user.resetPasswordToken}"> Promjena šifre </a>
        <br>
        <br>
        Ukoliko niste zatražili promjenu šifre ignorišite ovaj email.
        <br>
        <br>
        Želimo Vam ugodan dan!`;

        await mailer.sendEmail('admin@vina.sava.ba', user.email, 'Poslali ste zahtjev za promjenu šifre na vina.sava.ba', html);

        req.flash('success', 'Poslali smo Vam email sa potrebnim podacima za promjenu šifre.');
        res.redirect('/');
    };
};

exports.promjenaSifre = async (req, res) => {

    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    });

    console.log(user);

    if (!user) {
        req.flash('error', 'Nažalost, rok u kojem ste mogli promjeniti šifru je istekao!');
        res.redirect('/login');
    } else {
        req.flash('success', 'Molimo Vas da unesete novu šifru.')
        res.render('promjena-sifre', {
            title: 'Promjena šifre'
        });
    };
};

exports.promjenaSifreFinal = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token

    });
    console.log(user);

    if (!user) {
        req.flash('error', 'Nažalost istekao je rok u kojem ste mogli promjeniti šifru');
        return res.redirect('/');
    } else {
        console.log(req.body.password);
        const setPassword = promisify(user.setPassword, user);
        await setPassword(req.body.password);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        req.flash('success', 'Uspješno ste promjenili šifru! Možete se prijaviti.');
        res.redirect('/login');
    }
}