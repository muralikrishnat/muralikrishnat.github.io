var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

var window1 = null;

var getStocksData = function(range, mode){
    var lst = [];
    $('.dataTable').find('tr').each((i, n) => {
        var price = $(n).find('td:eq(3)').text();
        price = parseFloat(price.replace(/,/g, ''));
        var stockname = $(n).find('td:eq(0)').find('a').text().replace(/[^A-Za-z0-9 .]/g, '');
        var stocklink = $(n).find('td:eq(0)').find('a').attr('href');
        var pprice = $(n).find('td:eq(2)').text();
        pprice = parseFloat(pprice.replace(/,/g, ''))
        var group = $(n).find('td:eq(1)').text();
        lst.push({
            name: stockname,
            link: stocklink,
            currentprice: price,
            previousprice: pprice,
            group: group 
        });

    });
    let shares = JSON.stringify(lst);
    var myDate = new Date();
    var fileName = range + '-' + mode + '-' + (myDate.getMonth() + 1) + "-" + myDate.getDate() + "-" + myDate.getFullYear() + '.json';
    $.ajax({
        type: "POST",
        url: 'http://localhost:6589/api',
        data: JSON.stringify({
            mode: mode,
            fileName: fileName,
            shares: lst
        }),
        success: () => {},
        contentType: 'application/json',
        dataType: 'json'
    });
};

var getDriverByUrl = function(step){
    return driver.get(step.url).then(function () {
        return driver.executeScript(getStocksData, step.range, step.mode);
    })
};

var executeSteps = [];
executeSteps.push({
    url: 'http://money.rediff.com/gainers/bse/daily',
    range: 'daily',
    mode: 1
});
executeSteps.push({
    url: 'http://money.rediff.com/gainers/bse/weekly',
    range: 'weekly',
    mode: 1
});
executeSteps.push({
    url: 'http://money.rediff.com/gainers/bse/monthly',
    range: 'monthly',
    mode: 1
});
executeSteps.push({
    url: 'http://money.rediff.com/losers/bse/daily',
    range: 'daily',
    mode: 0
});
executeSteps.push({
    url: 'http://money.rediff.com/losers/bse/weekly',
    range: 'weekly',
    mode: 0
});
executeSteps.push({
    url: 'http://money.rediff.com/losers/bse/monthly',
    range: 'monthly',
    mode: 0
});
var stepIndex = 0;
var pickNextStep = function(){
    if (executeSteps[stepIndex]) {
        return getDriverByUrl(executeSteps[stepIndex++]).then(pickNextStep);
    } else {
        return {};
    }
};
try {

    pickNextStep().then(() => {
        driver.close();
    });

} catch (er) {
    //swallow it
}