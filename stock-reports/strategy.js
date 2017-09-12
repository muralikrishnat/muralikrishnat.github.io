var getParts = (r) => {
    var parts = r.split('-');
    var range = parts[0];
    var mode = parseInt(parts[1]);
    var month = parts[2];
    var date = parts[3];
    var year = parts[4].split('.')[0];
    return {
        range,
        mode,
        month,
        date,
        year
    };
};

var fs = require('fs');
var path = require('path');

var dailyStocks = [];
var dailyReportsFolder = path.join(__dirname, 'daily-reports');
var StrategyReportFolder = path.join(__dirname, 'strategy-reports');

var pathFileContentHash = [];

var readFile = function(path) {
    return new Promise((res, rej) => {
        fs.readFile(path, (err, data) => {
            pathFileContentHash.push({
                path: path,
                content: data
            });
            res({ err });
        });
    });
};

var readDir = function(path) {
    return new Promise((res, rej) => {
        fs.readdir(path, (err, data) => {
            res({ err, data });
        });
    });
}

var refineStocks = () => {
    console.log('Daily Stocks : ', dailyStocks.length);
    fs.writeFile(path.join(StrategyReportFolder, 'daily-6.json'), JSON.stringify({
        filename: 'daily-6.json',
        shares: dailyStocks
    }), () => {

    });

};
readDir(dailyReportsFolder).then(({ err, data }) => {
    if (!err) {
        var d_filesPromises = [];
        data.forEach((r) => {
            var parts = r.split('-');
            var range = parts[0];
            var mode = parseInt(parts[1]);
            var month = parts[2];
            var date = parts[3];
            var year = parts[4].split('.')[0];
            if (date == '6' && range == 'daily') {
                d_filesPromises.push(readFile(path.join(dailyReportsFolder, r)));
            }
        });
        Promise.all(d_filesPromises).then(() => {
            pathFileContentHash.forEach((p) => {
                var fileJSON = JSON.parse(p.content);
                var parts = getParts(fileJSON.fileName);
                fileJSON.shares.forEach(s => {
                    let currentprice = parseFloat(s.currentprice);
                    if (currentprice > 50 && currentprice < 150) {
                        dailyStocks.push({
                            name: s.name,
                            link: s.link,
                            mode: parts.mode,
                            range: parts.range,
                            currentprice: currentprice,
                            previousprice: parseFloat(s.previousprice)
                        });
                    }
                });
            });
            refineStocks();
        });
    }
});