// -----------------------------------------------------------------------------------------
// SBS - Stub Brand Server
// implemented in Node, Express and MongoDB
// -----------------------------------------------------------------------------------------

var express 	= require('express')
, 	mongoskin 	= require('mongoskin')
,	_			= require('lodash')

// Initialise Express App
var app = express()
app.set('json spaces', 2) // Format JSON results

// Connect to Mongo
var db = mongoskin.db('mongodb://@localhost:27017/dealers');

// -----------------------------------------------------------------------------------------
// API Routes

// @ /
// Introduce API
app.get('/', function(req, res, next) {
	res.json({'whoami' : 'I am the REST API for GetBrand'})
})

// @ /dealers
// Return a list of available DealerIDs
app.get('/dealers', function(req, res, next) {
	db.collection('brands').find({}, {'DealerID': true}).toArray(function(err, result) {
		if (err) throw err
		var dealer_ids = {'DealerIDs' : _.pluck(result, 'DealerID')}
		res.json(dealer_ids)
	});
})

// @ /brand/<FQDN> or /brand/<DealerID>
// Return brand for given FQDN or Dealer ID, or an error message if it's not found
app.get('/brand/:id', function(req, res, next) {
	if (isNaN(req.params.id))
	{
		db.collection('brands').findOne({'FQDN': req.params.id}, function(e, result) {
			if (e) return next(e)
			if (result === null) {
				res.status(404).json({'error': 'FQDN ' + req.params.id + ' Not Found'})
				return
			}
			delete result._id
			res.json(result)
		})
	}
	else
	{
		db.collection('brands').findOne({'DealerID': req.params.id}, function(e, result) {
			if (e) return next(e)
			if (result === null) {
				res.status(404).json({'error': 'DealerID ' + req.params.id + ' Not Found'})
				return
			}
			delete result._id
			res.json(result)
		})
	}
})

// -----------------------------------------------------------------------------------------
// Listen for incoming HTTP requests on Port 3000
app.listen(3000)