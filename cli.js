#! /usr/bin/env node

'use strict';

var chain = require('./lib/chain'),
	path = require('path'),
	resources = require(path.join(process.cwd(), 'chain.js')),
	express = require('express'),
	gulp = require('gulp');

var userArgs = process.argv;

var app = express();

if (userArgs.indexOf('-h') !== -1 || userArgs.indexOf('--help') !== -1) {
	return console.log('cli help');
}

if (userArgs.indexOf('-v') !== -1 || userArgs.indexOf('--version') !== -1) {
	return console.log(require('./package').version);
}

app.get('*', function(req, res){
	var result = resources.get(req.path);

	if(result){
		var source = gulp.src(path.join(process.cwd(), result.resolve())),
			stream = result.source().compile(source);

		stream.on('data', function(data){
			data.pipe(res);
		})
			.on('error', function(err){
				console.log(err);
			});
	}
	else{
		res.status(404).end('Not Found');
	}
});

app.listen(3000);


