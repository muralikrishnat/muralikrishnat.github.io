var static = require('node-static');
var rootRequest = require('request');
var fs = require('fs');
var path = require('path');
var https = require('https');

var buildInProgress = false;
var buildStatus = {};

module.exports = function (options) {
    var host = '127.0.0.1';
    if (options && options.host) {
        host = host;
    }
    var baseUrl = ' ';
    let origin = ' ';
    var buildparam = 'build-azuredev';
    if (options.endpoint) {
        if (options.endpoint.toLowerCase() === 'uat'.toLowerCase()) {
            baseUrl = '';
            origin = ' ';

            buildparam = 'build-azureuat';
        } else if (options.endpoint.toLowerCase() === 'prod'.toLowerCase()) {
            baseUrl = ' ';
            origin = '';

            buildparam = 'prod';
        }
    }


    var requestOptions = {
        url: '',
        headers: {
            'Content-Type': 'application/json',
            'Origin': origin
        },
        method: 'POST',
        json: true,
        body: {}
    };


    fePort = options.fePort;
    folder = options.folder || 'master';
    var requestHandler = function (request, response) {
        var body = [];
        if (request.url.indexOf('api') >= 0) {
            request.on('data', function (chunk) {
                body.push(chunk);
            });
        }
        request.addListener('end', function () {
            if (request.method === 'OPTIONS') {
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-api-key');
                response.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH');
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end();

            } else if (request.url.indexOf('api') >= 0) {
                body = Buffer.concat(body).toString();
                try {
                    body = JSON.parse(body);
                } catch (e) { }
                response.end(JSON.stringify({
                    msg: 'Build in prgoresssssss',
                    details: buildStatus
                }));
            } else {
                if (buildInProgress) {
                    response.writeHead(200, { 'content-type': 'text/html' });
                    response.end(JSON.stringify({
                        msg: 'Build in prgoresssssss',
                        details: buildStatus
                    }));
                } else {
                    var file = new static.Server('./' + folder, {
                        headers: {
                            gzip: true,
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET,POST,DELETE,PATCH',
                            'Access-Control-Allow-Headers': 'Authorization, Content-Type, x-api-key'
                        }
                    });
                    if (request.url.indexOf('.gz') >= 0) {
                        console.log('serving from gzip', request.url);
                        var headers = { 'Content-Encoding': 'gzip' };
                        if (request.url.indexOf('.css') >= 0) {
                            headers['Content-Type'] = 'text/css';
                        }
                        file.serveFile('/' + request.url, 200, headers, request, response);
                    } else {

                        file.serve(request, response, function (err, res) {
                            if (err && (err.status === 404) && request.url.indexOf('.html') < 0) {
                                fs.exists(path.join(__dirname, folder, 'index.html'), (exists) => {
                                    if (exists) {
                                        file.serveFile('/index.html', 200, {}, request, response);
                                    } else {
                                        response.writeHead(200, { 'content-type': 'text/html' });
                                        response.end(JSON.stringify({
                                            msg: 'Build in prgoresssssss static',
                                            details: buildStatus
                                        }));
                                    }
                                });
                            } else {
                                response.writeHead(200, { 'content-type': 'text/html' });
                                response.end('Resource Not Found');
                            }
                        });
                    }
                }
            }
        }).resume();
    };

    require('http').createServer(requestHandler).listen(fePort, () => {
        console.log('Server Listining on ' + fePort);
    });


    if (options && options.ssl) {
        let certOptions = {
            key: fs.readFileSync('certs/svd-dev.key'),
            cert: fs.readFileSync('certs/svd-rest-dev_evokedemoapps_com.crt')
        };

        if (options.endpoint.toLowerCase() === 'prod'.toLowerCase()) {
            certOptions = {
                key: fs.readFileSync('certs/prod/key.pem'),
                cert: fs.readFileSync('certs/prod/CA.crt')
            };
        }
        https.createServer(certOptions, requestHandler).listen(443, () => {
            console.log('Server STarted ');
        });
    }
};