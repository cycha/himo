//Définition des modules
const express = require("express");
const db = require("commons/db");
const bodyParser = require('body-parser');
const user = require("./controllers/userController")
const ad = require("./controllers/adController")

//Connexion à la base de donnée
db.connect()

//On définit notre objet express nommé app
const app = express();

//Body Parser
const urlencodedParser = bodyParser.urlencoded({
  extended: true
});
app.use(urlencodedParser);
app.use(bodyParser.json());
//TODO Use Helmet for protection

//Définition des CORS
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

//Définition du routeur
//TODO

app.post('/search', (req, res) => ad.search(req, res));

app.post('/user/signup', (req, res) => user.signup(req, res));
app.post('/user/login', (req, res)=> user.login(req, res));

// app.use("/user", router);
// require(__dirname + "/controllers/userController")(router);

//Définition et mise en place du port d'écoute
const port = 9000; //TODO ENV
app.listen(port, () => console.log(`Listening on port ${port}`));