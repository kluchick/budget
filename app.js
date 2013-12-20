
/**
 * Module dependencies
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  http = require('http'),
  path = require('path');

var app = module.exports = express();


/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
  app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
  // TODO
};


/**
 * Routes
 */

// JSON API
app.get('/api/name', api.name);
app.get('/api/charges', api.charges);
app.get('/api/getCharges', api.getCharges);
app.get('/api/getCategories', api.getCategories);
app.get('/api/getAccounts', api.getAccounts);
app.get('/api/getPeriods', api.getPeriods);
app.get('/api/getPlans', api.getPlans);

app.post('/api/addCharge', api.addCharge);
app.post('/api/addCategory', api.addCategory);
app.post('/api/finishCurPeriod', api.finishCurPeriod);
app.post('/api/addNewPeriod', api.addNewPeriod);
app.post('/api/addNewPlan', api.addNewPlan);
app.post('/api/updatePlan', api.updatePlan);
app.post('/api/changeAccountValue', api.changeAccountValue);


// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
