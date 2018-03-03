Kolekcija Vina - projekat za vježbu 

Kroz proces učenja već nekoliko mjeseci, gledajući razne tutorijale, najviše sam se oslonio na tutorial Learn Node od Wes Bosa. (https://learnnode.com). U aplikaciji sam i iskoristio nekoliko snippeta, konkretno dijelove webpack konfiguracije, css za flash poruke i čitav errorHandlers.js file. Jako mi se svidio način na koji se async/await funkcija umota u error handler koji je definisan u posebnom fajlu da bi se izbjeglo korištenje try/catch konstrukcije.

Vodio sam se idejom da napravim katalog vina za prijatelja koji je strastveni kolekcionar. Aplikacija je na bosanskom jeziku jer je namjenjena konkretnom korisniku kojem to odgovara i ima nekoliko različitih segmenata:

login/register: moguće se registrovati putem emaila. Preko mailgun servera na mail dobijete aktivacijski kod, te je potrebno aktivirati account. Također, moguće se prijaviti i putem facebooka. Korisnici koji su se registrovali putem emaila mogu se naknadno prijaviti i preko fb-a, te će se accounti uvezati. Nažalost, nije se moguće registrovati preko emaila nakon prijave sa fb.

Spisak mailova koji su u opticaju i na koje mailgun može poslati poruku. 
Šifre su iste za gmail i za aplikaciju.
S obzirom da stranica nema svoj DNS još uvijek nije aktivno slanje poruka na ostale adrese tako da je i registracija trenutno onemogućena. Registracija je izvršena za prve dvije email adrese

kolekcijavinaadm@gmail.com - pass: adminvina - registrovan,

kolekcijavinausr@gmail.com - pass: uservina - registrovan,

kolekcijavinausr2@gmail.com -pass: uservina - nije registrovan. Ostavljen za eventualnu probu aktivacije.

U slučaju gubitka šifre, moguće je poslati token na email adresu te pomoću linka koji korisnik dobije promjeniti šifru.

Svaki novi user po defaultu dobija level 30, što znaći da je običan korisnik. Pored običnog korisnika, nivoi koji su još u opticaju su glavni administrator (1), i administrator (10). Glavni administrator može mjenjati i brisati sve što su drugi korisnici postavili, te pošto je stranica poluprivatnog karaktera, samo on može postavljati i brisati slike iz galerije. Admin može dodijeliti ili oduzeti administratorska prava korisnicima. Nisam implementirao, ali imam namjeru, da glavni admin može obrisati ostale korisnike i eventualno sva vina koja su unijeli.

Baza podataka koja je korištena je mongodb. Postoje tri modela, vino, user i slika. Kako je tema stranice katalog vina, vino ima najviše karakteristika. Naziv, proizvođač, godina, zemlja porijekla, itd.. Kada user unese i snimi vino, automatski se povečava broj vina koje "ima" i obratno pri brisanju. Vina je moguće pretražiti po zemljama, vrstama i korisnicima koji su ga unijeli u bazu. Korisnik koji je unio vino i administratori ga mogu promjeniti ili eventualno izbrisati. Pri brisanju vina iz baze, iz file sistema se briše i slika. Također, isto se dešava i kada glavni admin obriše sliku iz galerije. 

Za učitavanje slika korišten je npm modul multer. Pri uploadu, slike se smanjuju pomoću jimp modula. Slike vina na 800px po dužoj strani, a slike za galeriju se snimaju u dva foldera: thumbs i big. Thumbs (400px) su thumbnail linkovi ka velikim slikama (1200px). U galeriji s desne strane je floating button koji otvara formu za upload, a sa lijeve button za brisanje slika. Oba dugmeta vidi samo glavni admin. Galerija koja je korištena je http://unitegallery.net/. Tiles tema mi je najviše ogovarala jer se slike slažu u kolone bez obzira na format. Kada se klikne dugme za brisanje otvara se novi prozor koji je veoma sličan prethodnom. Slike su također poredane u kolone, što sam postigao koristeći Masonry Layout (https://masonry.desandro.com/layout.html). Klikom na sliku otvara se modal gdje korisnik može potvrditi brisanje ili odustati. Sličan modal se otvara i pri brisanju vina iz baze.

Za css sam koristio materialize framework, a pug kao html template.

Problem na koji sam naišao je webpack. Htio sam da kroz webpack učitam scss, css i js fajlove što sam i uspio, ali samo lične fajlove. Kada pokušam da uvedem third party (materialize, masonry, jquery, unitegallery, itd..) fajlovi se kompajliraju ali iz nekog razloga javljaju se greške. Volio bih da to riješim prije ozbiljnog deploya koji imam namjeru napraviti, tj prije nego što dam stranicu prijatelju na korištenje. Trenutni deploy je na heroku: 

https://kolekcija-vina.herokuapp.com/.

lokalno pokretanje: npm run dev
port: 7777




