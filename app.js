// heavily used Wes Bos's Learn Node concept of creating apps
// Many thanks to Wes Bos for the effort to pass the knowledge

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const routes = require('./routes/index');
const helpers = require('./helpers');
const errorHandlers = require('./handlers/errorHandlers');
require('./handlers/passport');


// create Express app
const app = express();

// view engine
app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug'); // we use the engine pug, mustache or EJS work great too

// public folder
app.use(express.static(path.join(__dirname, 'public')));

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// validation
app.use(expressValidator());

// cookies
app.use(cookieParser());

// sessions
app.use(session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

// passport.js
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());

// pass variables to our templates + all requests
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

// routes!
app.use('/', routes);

// handling errors
app.use(errorHandlers.notFound);
app.use(errorHandlers.flashValidationErrors);

if (app.get('env') === 'development') {
  app.use(errorHandlers.developmentErrors);
}

app.use(errorHandlers.productionErrors);

module.exports = app;