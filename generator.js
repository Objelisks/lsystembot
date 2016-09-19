
var MAX_TWEET_LENGTH = 140;
var IMAGE_COST = 23;

/*
{"start":"F","rules":{"F":"FFB","B":"+F"}[,"a":60][,"iter":4][,"wiggly":true]}
*/

// TODO: special templates: symmetry, heavy branching, plants

function chooseRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function genRandomString(min, max, charSet) {
    var length = Math.floor(Math.random() * (max - min)) + min;
    var str = '';

    for(var i = 0; i < length; i++) {
        var char = chooseRandom(charSet);
        if(char === ']') {
            var insertIndex = Math.floor(Math.random()*(str.length));
            str = str.substring(0, insertIndex) + '[' + str.substring(insertIndex);
        }
        str += char;
    }
    return str;
}

exports.generate = function() {
    var system = {};
    var killOrder = ['a', 'iter'];
    var charSet = ['F'];
    var alphabet = 'ABCDEGHIJKLMNOPQRSTUVWXYZ'.split('');
    var controlCharSet = ['F', '+', '-', ']'];
    var angles = [36, 45, 60, 90];
    var iters = [4, 5, 6, 7];
    var i, index;

    var extraSymbols = Math.floor(Math.random()*5) + 1;
    for(i = 0; i < extraSymbols; i++) {
        index = Math.floor(Math.random()*alphabet.length);
        charSet.push(alphabet.splice(index, 1)[0]);
    }

    system.start = genRandomString(1, 5, charSet);

    system.rules = {};
    charSet.forEach(function(char) {
        var ruleStr = genRandomString(0, 10, charSet.concat(controlCharSet));
        if(ruleStr.length > 0) {
            system.rules[char] = ruleStr;
        }
    });


    // choose optional parameters (if not specified, random values are chosen later)
    system.a = chooseRandom(angles);
    system.iter = chooseRandom(iters);

    // shorten tweet length
    while((JSON.stringify(system).length > MAX_TWEET_LENGTH - IMAGE_COST) && (killOrder.length > 0)) {
        var remove = killOrder.pop();
        delete system[remove];
    }

    return system;
}
