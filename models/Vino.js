const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');
require('mongoose-strip-html-tags')(mongoose);
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const vinoSchema = new mongoose.Schema({
    naziv: {
        type: String,
        required: 'Morate unijeti naziv vina!',
        trim: true,
        stripHtmlTags: true

    },
    slug: {
        type: String,
        stripHtmlTags: true
    },
    slugZemlja: {
        type: String,
        stripHtmlTags: true
    },
    godina: {
        type: Number,
        trim: true,
        stripHtmlTags: true
    },
    proizvodjac: {
        type: String,
        required: 'Morate unijeti naziv proizvodjača!',
        trim: true,
        stripHtmlTags: true
    },
    vrsta: {
        type: String,
        required: 'Morate unijeti vrstu vina',
        trim: true,
        stripHtmlTags: true
    },
    zemlja: {
        type: String,
        required: 'Morate unijeti zemlju porijekla',
        trim: true,
        stripHtmlTags: true
    },
    slika: {
        type: String,
    },
    alkohol: {
        type: String
    },
    velicina: {
        type: String
    },
    datum: {
        type: Date,
        default: Date.now
    },
    korisnik: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: {
            select: 'ime'
        }
    },
    ime: {
        type: String
    }
});

// presave slug, proper function because we need to bind 'this'!!!
vinoSchema.pre('save', async function (next) {
    // if no changes, exit (return)
    if (!this.isModified('naziv')) {
        return next(); // stop function 
    }
    this.slug = slug(this.naziv);
    // this.slugZemlja = slug(this.zemlja);
    // next();
    // make unique slugs
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)`, 'i');
    const vinaSlug = await this.constructor.find({
        slug: slugRegEx
    });
    if (vinaSlug.length) {
        this.slug = `${this.slug}-${vinaSlug.length + 1}`;
    }
});

vinoSchema.statics.listaZemalja = function () {
    return this.aggregate([{
        $unwind: '$zemlja'
    },
    {
        $group: {
            _id: '$zemlja',
            count: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            _id: 1
        }
    }
    ]).collation({ locale: "hr", strength: 2 });
};

vinoSchema.statics.popisVrsti = function () {
    return this.aggregate([{
        $unwind: {
            path: '$vrsta',

        }
    },
    {
        $group: {
            _id: '$vrsta',
            count: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            _id: 1
        }
    }
    ]);
};

vinoSchema.statics.popisKorisnika = function () {
    return this.aggregate([{
        $unwind: {
            path: '$ime',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $group: {
            _id: '$ime',
            count: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            _id: 1
        }
    }
    ]);
};

vinoSchema.statics.popisGodina = function () {
    return this.aggregate([{
        $unwind: {
            path: '$godina',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $group: {
            _id: '$godina',
            count: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            _id: 1
        }
    }
    ]);
};

vinoSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Vino', vinoSchema);