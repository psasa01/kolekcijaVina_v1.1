const mongoose = require('mongoose');
const passport = require('passport');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: { type: 'error', message: 'Greška pri prijavljivanju!' },
    successRedirect: '/',
    successFlash: 'Uspješno ste se prijavili. Dobrodošli na "Moju Kolekciju Vina"!'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Uspješno ste se odjavili! Doviđenja :)');
    res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
        return;
    } else {
        req.flash('error', 'Morate biti prijavljeni da biste dodali novo vino!');
        res.redirect('login');
    };
};

exports.isAdministrator = (req, res, next) => {
    if(req.user && req.user.level < 11) {
        next();
        return;        
    } else {
        req.flash('error', 'Morate biti administrator da biste dodali novo vino!');
        res.redirect('/');
    }
}

exports.isActive = async(req, res, next) => {
    const user = await User.findOne({
        email: req.body.email
    });
    if(!user) {
        req.flash('error', 'Nažalost, u bazi ne postoji korisnik s navedenim podacima!');
        res.redirect('login');
    }
    else if (user.active === true) {
        return next();
    } else {
        req.flash('error', 'Da biste se prijavili morate aktivirati korisnički račun. Provjerite email!');
        res.redirect('login');
    }
}

exports.aktivacija = (req, res) => {
    res.render('aktivacija', {
        title: 'Aktivacija korisničkog računa'
    });
};

exports.aktiviraj = async(req, res) => {
    const token = req.body.token;

    const user = await User.findOne({
        secretToken: token
    });

    if (!user) {
        req.flash('error', 'Token koji ste unijeli nije validan');
        res.redirect('register');
    } else {
        user.active = true;
        await user.save();
        req.flash('success', 'Uspješno ste aktivirali račun! Možete nastaviti s prijavom.');
        res.redirect('login');
    };
}