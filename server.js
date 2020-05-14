const webPush = require('web-push');
const vapidKeys = webPush.generateVAPIDKeys();
 
webPush.setVapidDetails(
    'http://localhost:3434',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

var requestHandler = function(request, response) {
    var body = [];
    if (request.url.indexOf('api') >= 0) {
        request.on('data', function(chunk) {
            body.push(chunk);
        });
    }
    request.addListener('end', function() {
        if (request.method === 'OPTIONS') {
            response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
            response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-api-key');
            response.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH,OPTIONS');
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end();

        } else if (request.url.indexOf('api') >= 0) {
            response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
            response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-api-key');
            response.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH,OPTIONS');
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            body = Buffer.concat(body).toString();
            try {
                body = JSON.parse(body);
            } catch (e) {}


            if (request.url.indexOf('api/vapidPublicKey') >= 0) {
                body = {
                    publicKey: vapidKeys.publicKey,
                    privateKey: vapidKeys.privateKey
                }
            }

            if (request.url.indexOf('api/sendNotification') >= 0) {
                console.log("subscription", body.subscription);
                webPush.sendNotification(body.subscription, JSON.stringify({}), { TTL: 0})
                    .then(function() {
                        response.end(JSON.stringify({
                            data: body
                        }));
                    })
                    .catch(function(error) {
                        response.end(JSON.stringify({
                            success: false
                        }));
                    });
            } else {
                response.end(JSON.stringify({
                    data: body
                }));
            }

            
        }
    }).resume();
};
require('http').createServer(requestHandler).listen(3434, () => {
    console.log('Server Listining on ' + 3434);
});