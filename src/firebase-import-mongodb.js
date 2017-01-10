#!/usr/bin/env node
var fs 			= require('fs');
var getopt 		= require('node-getopt');
var firebase 	= require('firebase');
var admin 		= require("firebase-admin");
var MongoClient = require('mongodb').MongoClient;
var logger 		= require(__dirname + '/../lib/logger');

var opt = getopt.create([
    ['f', 'firUrl=ARG', 'index where you will import'],
    ['s', 'serviceAccountFile=ARG', 'path of the firebase auth json file'],
    ['h', 'mongoHost=ARG', 'mongodb host to connect to'],
    ['p', 'mongoPort=ARG', 'mongodb port to connect to'],
    ['d', 'mongoDB=ARG', 'mongodb database to use to'],
    ['c', 'collection=ARG', 'mongodb collection to insert in'],
    ['n', 'node=ARG', 'firebase node to export'],
    ['h', 'help', 'display this help'],
    ['v', 'version', 'show version']
])
    .bindHelp()
    .parseSystem();

/*
** Recuperation Arguments
*/
var firUrl = opt.options.firUrl ? opt.options.firUrl : null;
var serviceAccountFile = opt.options.serviceAccountFile ? opt.options.serviceAccountFile : null;
var mongoHost = opt.options.mongoHost ? opt.options.mongoHost : 'localhost';
var mongoPort = opt.options.mongoPort ? opt.options.mongoPort : '27017';
var mongoDB = opt.options.mongoDB ? opt.options.mongoDB : 'firebase';
var node = opt.options.node ? opt.options.node : null;
var collection = opt.options.collection ? opt.options.collection : node;

var docInserted = 0;
var limit = 10;

function handleExporting(fbClient, mgClient, node, totalCount, lastKey, collection, callback) {
	var added = 0;
	var checkFirst = 0;
	var lastKeyTmp = null;
	var ref = fbClient.ref(node);
	ref.orderByKey().startAt(lastKey).limitToFirst(limit).once('value', function(snapshot) {
		var count = snapshot.numChildren();
		if (count > 0) {
			if (snapshot.val()) {
				snapshot.forEach(function(objectFound) {
					if (objectFound.key !== lastKey) {
						var object = objectFound.val();
						object.key = objectFound.key;
						object._id = objectFound.key;
						lastKeyTmp = object.key;
						mgClient.collection(collection).insertOne(object, function(err, response) {
							if (err) { console.log('error mongodb', err); }
							++added;
							if (!err) { ++totalCount; }
							if (added >= count) {
								handleExporting(fbClient, mgClient, node, totalCount, lastKeyTmp, collection, callback);
							}
						});
					} else {
						++added;
						if (added >= count) { callback(null, totalCount); }
					}
				});
			}
		} else {
			callback(null, totalCount);
		}
	}, function (errorObject) {
		callback(errorObject, totalCount);
	});
}

function exportNode(fbClient, mgClient, node, collection, callback) {
	console.log('exporting will start from', node, 'to', collection);
	handleExporting(fbClient, mgClient, node, 0, '', collection, callback);
}

if (firUrl && serviceAccountFile && node) {
	/*
		var config = {
			serviceAccount: serviceAccountFile,
		  	databaseURL: firUrl
		};
		firebase.initializeApp(config);
		var firDB = firebase.database();
	*/
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccountFile),
		databaseURL: firUrl
	});
	var mgClient = undefined;
	var fbClient = admin.database();
	console.log('Connected to firebase');
	var mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + mongoDB;
	MongoClient.connect(mongoUrl, function(err, client) {
		if (err) {
			console.log('mongodb connection failed, check if your mongod is started');
		} else {
			console.log('Connected to mongoDB');
			mgClient = client;
			exportNode(fbClient, mgClient, node, collection, function(error, response) {
				if (error) {
					console.log('error', error);
				} else {
					console.log('exported done', response);
				}
				process.exit(process.pid);
			});
		}
	});
} else {
	console.log('error: please insert input option (--help for more information)');
}