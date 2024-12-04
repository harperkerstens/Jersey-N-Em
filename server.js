const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const sql = require('mssql');
const formidable = require('formidable'); // Add this line

let loadData = require('./routes/loaddata');
let listOrder = require('./routes/listorder');
let listProd = require('./routes/listprod');
let addCart = require('./routes/addcart');
let showCart = require('./routes/showcart');
let checkout = require('./routes/checkout');
let order = require('./routes/order');
let login = require('./routes/login');
let validateLogin = require('./routes/validateLogin');
let logout = require('./routes/logout');
let admin = require('./routes/admin');
let product = require('./routes/product');
let displayImage = require('./routes/displayImage');
let customer = require('./routes/customer');
let ship = require('./routes/ship');
let index = require('./routes/index');
let listTeam = require('./routes/listTeam');
let team = require('./routes/team');
let createAccount = require('./routes/createAccount');

const app = express();

// This DB Config is accessible globally
dbConfig = {    
  user: 'harper',
  password: 'harper',  // Your actual password
  server: 'localhost',  // Use 'localhost' or the Docker container name if in a container
  database: 'orders',  // Ensure this is the correct database name
  options: {
      encrypt: false,  // Encryption setting for secure connections
      trustServerCertificate: true,  // Trust self-signed certificates if you're not using a CA
      enableArithAbort: false,  // For performance reasons
      port: 1433  // Default SQL Server port, if not specified
  }
}

// Setting up the session.
// This uses MemoryStorage which is not
// recommended for production use.
app.use(session({
  secret: 'COSC 304 Rules!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 60000*5,
  }
}))

// Setting up the rendering engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Setting up Express.js routes.
// These present a "route" on the URL of the site.
// Eg: http://127.0.0.1/loaddata
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // To handle URL-encoded form data
app.use(express.json()); // To handle JSON data
app.use('/', index);
app.use('/loaddata', loadData);
app.use('/listorder', listOrder);
app.use('/listprod', listProd);
app.use('/addcart', addCart);
app.use('/showcart', showCart);
app.use('/checkout', checkout);
app.use('/order', order);
app.use('/login', login);
app.use('/validateLogin', validateLogin);
app.use('/logout', logout);
app.use('/admin', admin);
app.use('/product', product);
app.use('/displayImage', displayImage);
app.use('/customer', customer);
app.use('/ship', ship);
app.use('/listTeam', listTeam);
app.use('/team', team);
app.use('/createAccount', createAccount);

// Starting our Express app
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});