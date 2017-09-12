onmessage = function(e) {
    var workerData = e.data;
    // var stockString = '';
    // console.log('Got request to logic');
    // var addedshares = [];
    // // shares.sort((a, b) => {
    // //     console.log(': ', a.currentprice , ' => ', b.currentprice)
    // //     return a.currentprice > b.currentprice;
    // // });
    // var filteredShares = [];
    // shares.forEach(s => {
    //     let isGainer = s.mode === 0 ? 'Loser' : 'Gainer';
    //     if (s.mode === 1 && s.currentprice >= 90 && s.currentprice < 100) {
    //         filteredShares.push(s);
    //         stockString += `<div><a href="${s.link}">${s.name}</a> - Current Price : ${s.currentprice} ; Previous Price : ${s.previousprice} ; ${isGainer}</div>`;
    //     }
    // });
    var resp = {
        result: []
    };
    switch (workerData.action) {
        case 'and':
            var shares1 = workerData.shares1;
            var shares2 = workerData.shares2;
            var addresult = [];
            shares1.forEach((s) => {
                if (shares2.filter(r => { return r.name.trim() == s.name.trim() }).length > 0) {
                    addresult.push(s);
                }
            });
            resp.addresult = addresult;
            break;
        case 'filter':
            var conditions = workerData.conditions;
            var shares = workerData.shares;
            shares.forEach(s => {
                if (conditions) {
                    var isThrough = 0;
                    conditions.forEach(c => {
                        if (s[c.prop]) {
                            var propval = parseFloat(s[c.prop]);
                            if (c.operand == 'g' && propval > c.val) {
                                isThrough += 1;
                            } else if (c.operand == 'l' && propval < c.val) {
                                isThrough += 1;
                            } else if (c.operand == 'le' && propval <= c.val) {
                                isThrough += 1;
                            } else if (c.operand == 'ge' && propval >= c.val) {
                                isThrough += 1;
                            } else if (c.operand == 'e' && propval == c.val) {
                                isThrough += 1;
                            }
                        }
                    });

                    if (isThrough === conditions.length) {
                        resp.result.push(s);
                    }
                } else {
                    resp.result.push(s);
                }
            });
            break;
        default:
            break;
    }
    resp.timestamp = workerData.timestamp;
    postMessage(resp);
}