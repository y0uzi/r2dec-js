/* 
 * Copyright (c) 2017-2018, pancake <pancake@nopcode.org>, Giovanni Dante Grazioli <deroad@libero.it>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * https://github.com/svaarala/duktape/blob/master/doc/error-objects.rst
 * 
 * this is required to be the first thing to be setup
 * when there is an exception i want to have the whole
 * stack to be printed.
 */
Duktape.errCreate = function(err) {
    try {
        if (typeof err === 'object') {
            var p = {
                message: '' + err.message,
                stack: '' + err.stack,
                lineNumber: '' + err.lineNumber
            };
            return p;
        }
    } catch (e) {}
    return err;
};

/**
 * Global data accessible from everywhere.
 * @type {Object}
 */
var Global = {
    context: null,
    evars: null,
    printer: null,
    warning: require('libdec/warning')
};


/**
 * Imports.
 */
var libdec = require('libdec/libdec');
var r2util = require('libdec/r2util');

/**
 * r2dec main function.
 * @param  {Array} args - r2dec arguments to be used to configure the output.
 */
function r2dec_main(args) {
    var Printer = require('libdec/printer');
    try {
        Global.evars = new r2util.evars(args);
        r2util.sanitize(true, Global.evars);
        if (r2util.check_args(args)) {
            r2util.sanitize(false, Global.evars);
            return;
        }

        // theme (requires to be initialized after evars)
        Global.printer = new Printer();

        var architecture = libdec.archs[Global.evars.arch];

        if (architecture) {
            var data = new r2util.data();
            Global.context = new libdec.context();
            // af seems to break renaming.
            /* asm.pseudo breaks things.. */
            if (data.graph && data.graph.length > 0) {
                var p = new libdec.core.session(data, architecture);
                var arch_context = architecture.context(data);
                libdec.core.analysis.pre(p, architecture, arch_context);
                libdec.core.decompile(p, architecture, arch_context);
                libdec.core.analysis.post(p, architecture, arch_context);
                p = null;
                libdec.core.print(p);
            } else {
                console.log('Error: no data available.\nPlease analyze the function/binary first.');
            }
        } else {
            console.log(Global.evars.arch + ' is not currently supported.\n' +
                'Please open an enhancement issue at https://github.com/wargio/r2dec-js/issues');
            libdec.supported();
        }
        r2util.sanitize(false, Global.evars);
    } catch (e) {
        r2util.debug(Global.evars, e);
    }
}