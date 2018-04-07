var express        = require('express');
var app            = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose       = require('mongoose');
var methodOverride = require('method-override');
var passport = require('passport');

var index = require('./app/routes/index');
var users = require('./app/routes/users');
var db = require('./app/config/db');
var authLocal = require('./app/auth/local');
var port = process.env.PORT || 8081; // set our port
var url = 'mongodb://localhost:27017/testDb1';

mongoose.connect(url);

/*authLocal.use();
authLocal.init();

app.use(passport.initialize());
app.use(passport.session());*/

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});


db.connect(url, function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.')
    process.exit(1)
  } else {
	app.listen(port);	
	console.log('Magic happens on port ' + port); 			// shoutout to the user
  }
})
exports = module.exports = app; 						// expose app

