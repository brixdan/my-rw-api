var http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose');

process.env.NODE_ENV = "develop"  // bd todo later
var isProduction = process.env.NODE_ENV === 'production';

console.log('process.env.NODE_ENV=',process.env.NODE_ENV)
// Create global app object
var app = express();


// good for local api, no good for heroku
app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
  app.use(errorhandler());
}

if(isProduction){
  mongoose.connect(process.env.MONGOLAB_SILVER_URI, { useNewUrlParser: true })
} else {

// mongoose.connect('mongodb://localhost/conduit',{ useNewUrlParser: true } );
  // mongoose.connect("mongodb://heroku_h7b0lnz7:hgg7b32j0tt15mi25h3hub4d2d@ds129402.mlab.com:29402/heroku_h7b0lnz7")
// mongoose.connect(process.env.MONGOLAB_SILVER_URI, { useNewUrlParser: true })
mongoose.connect("mongodb+srv://brixdan:MOz0x9c8v7@cluster1-4brtq.mongodb.net/conduit?retryWrites=true&w=majority", { useNewUrlParser: true })
  mongoose.set('debug', true);
}
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});
require('./models/User');
require('./models/Article');
require('./models/Comment');
require('./config/passport');

app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
