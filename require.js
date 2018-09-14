var include = function(x) {
	return ___internal_load(x);
};
var require = function(x) {
    try {
        if (arguments.callee.loaded[x]) {
            return arguments.callee.loaded[x];
        }
        var module = {
            exports: null
        };
        console.log(12);
        console.log(___internal_require(x))
        console.log(34);
        arguments.callee.loaded[x] = module.exports;
        return module.exports;
    } catch (ee) {
        console.log('Exception from ' + x);
        console.log(ee.stack);
    }
};
require.loaded = {};
console.log(require('libdec/warning'))