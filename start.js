const mongoose = require('mongoose');

// import env variables from variables.env file
require('dotenv').config({
  path: 'variables.env'
});

// Connect to Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`${err.message}`);
});

// import models
require('./models/Vino');
require('./models/User');
require('./models/Slika');

// Start app!
const app = require('./app');
app.set('port', process.env.PORT || 3333);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});