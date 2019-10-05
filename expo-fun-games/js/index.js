var executeCode = function (code, scope) {
    let variablesStr = 'var ' + Object.keys(scope).map(k => {
        return k + '=' + JSON.stringify(scope[k]);
    }).join(',') + ';';
    let codeToExecute = code, parsedCode = code;
    try {
        var fnToExecute = new Function(variablesStr + ' return `' + codeToExecute + '`;');
        parsedCode = fnToExecute();
        parsedCode = parsedCode.replace('undefined', '');
    } catch (e) {
        //swallow
    }
    return parsedCode;
};

var scanElement = function(elem, scope) {
    for (let i = 0; i < elem.attributes.length; i++) {
        let attribute = elem.attributes[i];
        if (attribute.value && attribute.value.indexOf('${') >= 0) {
            attribute.value = executeCode(attribute.value, scope).replace('undefined', '');
        }
    }
    if (elem.children.length > 0) {
        for (let j = 0; j < elem.children.length; j++) {
            let item = elem.children[j];
            scanElement(item, scope);
        }
    } else {
        elem.innerHTML = executeCode(elem.innerHTML, scope).replace('undefined', '');
    }
};

var applyScope = function(scopeElem, scope) {
    scanElement(scopeElem, scope);
};