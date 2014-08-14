var createChain = require('../lib/chain'),
	Source = require('../lib/source');

describe('Resource chain', function(){
	it('should be a function', function(){
		expect(typeof createChain).toBe('function');
	});

	it('should return a new chain instance', function(){
		var one = createChain(), two = createChain();

		expect(one).not.toBe(two);
	});

	describe('resource method', function(){
		var chain;

		beforeEach(function(){
			chain = createChain();
		});

		it('should be a function', function(){
			expect(typeof chain.resource).toBe('function');
		});

		it('should allow chaining', function(){
			expect(chain.resource('/path')).toBe(chain);
		});

		it('should register a new path', function(){
			var source = new Source('path.png');
			chain.resource('/path', source);

			expect(chain.paths['/path']).toBe(source);
		});

		it('should setup match keys', function(){
			var path = '/{1}/{2}/{file}.js';
			chain.resource(path, new Source('{file}.js'));

			expect(chain.pathKeys[path]).toEqual(['1', '2', 'file']);
		});
	});

	describe('get method', function(){
		var chain;

		beforeEach(function(){
			chain = createChain();
		});

		it('should exist', function(){
			expect(typeof chain.get).toBe('function');
		});

		describe('return value', function(){
			var retVal, source;

			beforeEach(function(){
				chain = createChain();
				source = new Source('test.js');

				chain.resource('/test.js', source);
				retVal = chain.get('/test.js');
			});

			it('should have a resolve method that resolves', function(){
				chain.resource('/{dir}/{file}.css', new Source('{dir}/styles/{file}.less'));

				retVal = chain.get('/theme/dark.css');

				expect(retVal.resolve()).toBe('theme/styles/dark.less');
			});

			it('should have a source method', function(){
				expect(typeof retVal.source).toBe('function');
			});

			it('should be null if there is no match', function(){
				retVal = chain.get('/404');

				expect(retVal).toBe(null);
			});

			it('should have the source method return the same source object', function(){
				expect(retVal.source()).toBe(source);
			});

			it('should return the originally request path on the path variable', function(){
				expect(retVal.path()).toBe('/test.js');
			});

			it('should return match data', function(){
				expect(retVal.match()).toEqual({});
			});

			it('should return the source based on patterns', function(){
				source = new Source('{1}.less');

				chain.resource('/{1}.css', source);
					retVal = chain.get('/foo.css');

					expect(retVal.source()).toBe(source);
			});

			it('should match patterns', function(){
				chain.resource('/{1}/{2}.css', new Source('{1}/{2}.less'));
				retVal = chain.get('/path/thing/foo.css');

				expect(retVal.match()).toEqual({
					1:'path/thing',
					2:'foo'
				});
			});
		});
	});
});
