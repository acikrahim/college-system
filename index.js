//College system for UNIMAS's colleges

var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();
var router = express.Router();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(methodOverride('X-HTTP-Method-Override'));

// CORS support
app.use(function (req, res, next)	{
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.use('/assets', express.static(__dirname + '/assets'));
app.use('/views', express.static(__dirname + '/views'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(require('./routes'));

// app.get('/public', function (request, respond)	{
// 	respond.sendFile(__dirname + '/views/public/index.html')
// })

app.get('/admin', function (request, respond)	{
	respond.sendFile(__dirname + '/views/index.html')
})

app.listen(port, "0.0.0.0", function (err)	{
	if (err)
		throw err;
	console.log('Listening on port ' + port + '...');
});
