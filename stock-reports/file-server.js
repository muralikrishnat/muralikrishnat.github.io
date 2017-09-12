var static = require('node-static');
var url = require('url');

var fs = require('fs');
var path = require('path');


var sendResponse = function(response, body){
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    response.writeHead(200, {
        'Content-Type': 'application/json'
    });
    response.end(body);
}
module.exports = function(options) {
    fePort = options.fePort;
    folder = options.folder || 'app';
    var file = new static.Server(__dirname, { cache: 3600, headers: { gzip: true, 'Access-Control-Allow-Origin':'*' } });
    var server = require('http').createServer((request, response) => {

        var body = '';
        if (request.url.indexOf('api') >= 0) {
            request.on('data', function(chunk) {
                body += chunk;
            });
        }

        request.addListener('end', function() {
            if (request.method === 'OPTIONS') {
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end();

            } else if (request.url.indexOf('api') >= 0) {
                let parsedData = JSON.parse(body);
                if (parsedData.shares) {
                    console.log('shares ', parsedData.shares.length);
                    var fileName =  parsedData.fileName || ('sept-5-' + parsedData.range + '-' + parsedData.mode + '.json');
                    fs.writeFile(path.join(__dirname, 'daily-reports', fileName), body, (err) => {
                        console.log('fileName ', fileName, err);
                    });
                    sendResponse(response, body);
                } else if(parsedData.action === "GET-STOCKS"){
                    fs.readdir(path.join(__dirname, 'total-stocks'), (err, files) => {
                        sendResponse(response, JSON.stringify({
                            data: files
                        }));
                    });
                } else if(parsedData.action === "GET-FOLDER"){
                    fs.readdir(path.join(__dirname, parsedData.folderName), (err, files) => {
                        sendResponse(response, JSON.stringify({
                            data: files
                        }));
                    });
                }  else {
                    sendResponse(response, body);
                }
               
            } else {
                file.serve(request, response, function(err, res) {
                    if (err && (err.status === 404) && request.url.indexOf('.html') < 0) {
                        file.serveFile('index.html', 200, {}, request, response);
                    } else {
                        // response.setHeader('Access-Control-Allow-Origin', '*');
                        // response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                        // response.writeHead(200, { 'content-type': 'text/html' });
                        response.end('Resource Not Found');
                    }
                });

            }
        }).resume();
    }).listen(fePort, options.ip || '127.0.0.1', () => {
        console.log('Server Listining on ' + fePort);
    })
};