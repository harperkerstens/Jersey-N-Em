const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

let loadData = require('./routes/loaddata');
let listOrder = require('./routes/listorder');
let listProd = require('./routes/listprod');
let addCart = require('./routes/addcart');
let showCart = require('./routes/showcart');
let checkout = require('./routes/checkout');
let order = require('./routes/order');

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
app.use('/loaddata', loadData);
app.use('/listorder', listOrder);
app.use('/listprod', listProd);
app.use('/addcart', addCart);
app.use('/showcart', showCart);
app.use('/checkout', checkout);
app.use('/order', order);

// Rendering the main page
app.get('/', function (req, res) {
  res.render('index', {
    title: "YOUR NAME Grocery Main Page"
  });
});

// Starting our Express app
// app.listen(3000)

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});