
var MAX_IMAGE_TWEET_LENGTH = 117;

//json syntax character cost
var START_COST = 10;
var RULES_COST = 9;
var RULE_COST_EACH = 7;
var ANGLE_COST = 5;
var ITER_COST = 8;
var COLOR_COST = 11;
var WIGGLE_COST = 10;

/*
{"start":"F","rules":{"F":"FFB","B":"+F"}[,"a":60][,"iter":4][,"color":"#afafaf"][,"wiggly":true]}
max tweet length:
.........,.........,.........,.........,.........,.........,.........,.........,.........,.........,.........,.......
*/

exports.generate = function() {
    var charsRemaining = MAX_IMAGE_TWEET_LENGTH;
    var elementsRemaining = ['start', 'rules', 'a', 'iter', 'color', 'wiggly'];

}