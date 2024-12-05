const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const crypto = require('crypto');
const fs = require('fs');
const mime = require('mime-types');
const app = express();

const productDetailsRouter = require('./routes/productdetails');
const adminRouter = require('./routes/admin');
const customerRouter = require('./routes/customer');
const listProdRouter = require('./routes/listprod');
const productRouter = require('./routes/product');
const showCartRouter = require('./routes/showcart');
const addCartRouter = require('./routes/addcart');
const orderRouter = require('./routes/order');
const paymentRouter = require('./routes/payment');
const profileRouter = require('./routes/profile');

mongoose.connect('mongodb://localhost:27017/shopping', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

const dbConfig = {
  user: 'your_db_user',
  password: 'your_db_password',
  server: 'your_db_server',
  database: 'your_db_name',
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    enableArithAbort: true
  }
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: db })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root    = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/productdetails', (req, res, next) => {
  req.dbConfig = dbConfig;
  next();
}, productDetailsRouter);

app.use('/admin', (req, res, next) => {
  req.dbConfig = dbConfig;
  next();
}, adminRouter);

app.use('/customer', (req, res, next) => {
  req.dbConfig = dbConfig;
  next();
}, customerRouter);

app.use('/listprod', (req, res, next) => {
  req.dbConfig = dbConfig;
  next();
}, listProdRouter);

app.use('/product', (req, res, next) => {
  req.dbConfig = dbConfig;
  next();
}, productRouter);

app.use('/showcart', (req, res, next) => {
  req.dbConfig = dbConfig;
  next();
}, showCartRouter);

app.use('/addcart', (req, res, next) => {
  req.dbConfig = dbConfig;
  next();
}, addCartRouter);

app.use('/cart', (req, res, next) => {
  req.dbConfig = dbConfig;
  next();
}, showCartRouter);

app.use('/order', (req, res, next) => {
  req.dbConfig = dbConfig;
  next();
}, orderRouter);

app.use('/payment', (req, res, next) => {
  req.dbConfig = dbConfig;
  next();
}, paymentRouter);

app.use('/profile', (req, res, next) => {
  req.dbConfig = dbConfig;
  next();
}, profileRouter);

app.get('/', function(req, res) {
  res.render('index');
});

app.listen(3000, function() {
  console.log('Server started on port 3000');
});
