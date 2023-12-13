const cookieParser=require('cookie-parser');
var session = require('express-session');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const fs = require('fs');
const app = express();
app.use(cookieParser());
const port = 6789;
var sqlite3 =require('sqlite3');
const req = require('express/lib/request');

app.use(cookieParser());
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 10000
	}
}));

// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-uluieste views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client(e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc înformat json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));
// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'HelloWorld'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res


app.get('/', (req, res) => {
  db.all('SELECT * FROM produse',(err,rows) => {
  res.render('index', {produse:rows, u:req.cookies.utilizator});
});
});

app.post('/adaugare_cos/:id',(req,res) => {
	console.log('Am adaugat produsul cu id-ul '+req.params.id);
	if(req.session.cos == undefined) {
		req.session.cos=[];
		req.session.cos.push(req.params.id);
	}
	else {
		req.session.cos.push(req.params.id);
	}
	res.redirect('/');
});

//chestionar

app.get('/chestionar', (req, res) => {
	fs.readFile('intrebari.json', (err, data) => {
		if (err) console.log(err);
		const listaIntrebari = JSON.parse(data);

		// în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
	    res.render('chestionar', {intrebari:listaIntrebari, u: req.cookies.utilizator});
	});
});
//end of chestionar

//rezultat chestionar 
app.post('/rezultat-chestionar', (req, res) => {
	const intrebari = Object.keys(req.body)
	console.log(intrebari)
	var count = 0
	for (var i = 0; i < intrebari.length; ++i) {

		if (req.body[`${intrebari[i]}`][0] == req.body[`${intrebari[i]}`][1]) {
			count++
		}
	}
	console.log(req.body);
	res.render('rezultat-chestionar', { count: count, u: req.cookies.utilizator });
});
//end of rezultat chestionar


//autentificare
app.get('/autentificare',(req, res) => {
	const mesajEroare = req.cookies.mesajEroare || '';
	res.render('autentificare', { mesajEroare: req.cookies.mesajEroare ,u: req.cookies.utilizator})

});

//end of autentificare

//verificare autentificare
 app.post('/verificare-autentificare',(req,res) => {
	 const utilizatoriJSON = require("./utilizatori.json");
	 for(let i=0; i<utilizatoriJSON.length; i++)
	 {
		 if(utilizatoriJSON[i].utilizator == req.body.user && utilizatoriJSON[i].parola == req.body.pwd)
		 {
			 res.cookie('utilizator', req.body.user);
			 return res.redirect('/');
		 }
	 }
	 
	 res.cookie("mesajEroare","Utilizator sau parolă incorecte!");
	 res.render("autentificare" , { mesajEroare: req.cookies.mesajEroare });
	 console.log(req.body);

 });

 //end of ver. autentificare

 //delogare

 app.get('/delogare',(req,res) => {
  res.clearCookie('utilizator');
  req.user=null;
  res.redirect('/autentificare');
});


//end of delogare



//baza de date
let db= new sqlite3.Database('./cumparaturi.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
        } else if (err) {
            console.log("Getting error " + err);
            exit(1);
    }
});

function createDatabase() {
    var newdb = new sqlite3.Database('cumparaturi.db', (err) => {
        if (err) {
            console.log("Getting error " + err);
            exit(1);
        }
    });
}

app.get('/creare-bd',(req, res) => {
	//console.log("creare bd");
	db.exec(`
	    create table produse(
			id int primary key not null,
			nume text not null,
			platforma text not null,
			pret int not null
		);   
	`,()=> { res.redirect('/');});
});

app.get('/inserare-bd', (req, res) => {
	
	db.exec(`
	 insert into produse (id, nume, platforma, pret)
	     values (1,'Lord of the Rings','prime', 150),
	 	        (2, 'The boys', 'prime',80),
				(3, 'Hell or High Water', 'netflix', 90),
				(4, 'Gladiator,'netflix', 25),
				(5, 'Dune', 'hbo', 100),
				(6, 'Silence of the Lambs', 'hbo', 79),
				(7, 'Fight Club','other', 35)'			
	`, () => { res.redirect('/') })

});

//end of database

app.get('/', (req, res) => {
   res.render('index');
 });
 
 app.get('/auth', (req, res) => {
   // Aici ar trebui să adăugați codul pentru pagina de autentificare
 });
 
 app.listen(6789, () => {
   console.log('Serverul a pornit pe portul 6789');
 });
