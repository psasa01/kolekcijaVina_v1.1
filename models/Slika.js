const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const slikaSchema = new mongoose.Schema({
    opis: {
        type: String
    },
    thumb: String,
    big: String
})

module.exports = mongoose.model('Slika', slikaSchema);