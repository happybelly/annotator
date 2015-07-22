"use strict";

var $ = require('jquery');
var Promise = require('es6-promise').Promise;

var ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#47;"
};


// escapeHtml sanitizes special characters in text that could be interpreted as
// HTML.
function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (c) {
        return ESCAPE_MAP[c];
    });
}


// getGlobal returns the global object (window in a browser, the global
// namespace object in Node, etc.)
function getGlobal() {
    // jshint -W054
    return new Function('return this')();
    // jshint +W054
}


// I18N
var gettext = (function () {
    var g = getGlobal();

    if (typeof g.Gettext === 'function') {
        var _gettext = new g.Gettext({domain: "annotator"});
        return function (msgid) { return _gettext.gettext(msgid); };
    }

    return function (msgid) { return msgid; };
}());


// Returns the absolute position of the mouse relative to the top-left rendered
// corner of the page (taking into account padding/margin/border on the body
// element as necessary).
function mousePosition(event) {
    var body = getGlobal().document.body;
    var offset = {top: 0, left: 0};

    if ($(body).css('position') !== "static") {
        offset = $(body).offset();
    }

    return {
        top: event.pageY - offset.top,
        left: event.pageX - offset.left
    };
}

// https://stackoverflow.com/questions/3454526/
// JCD, TODO: unknown license
function getXPath( element )
{
    var xpath = '';
    for ( ; element && element.nodeType == 1 && element.tagName.toLowerCase() !== 'body'; element = element.parentNode )
    {
        var id = $(element.parentNode).children(element.tagName).index(element) + 1;
        //id > 1 ? (id = '[' + id + ']') : (id = '');
        id = '[' + id + ']';
        xpath = '/' + element.tagName.toLowerCase() + id + xpath;
    }
    return xpath;
}


// Needleman-Wunsch linear alignment of two arrays
// Huan - this is what I set out to do
function lAlign(a, b) {
    var current = [];
    var lookback = [];

    var nw_match = 2;
    var nw_mismatch = -1;
    var nw_indel = 0;

    for (var j = 0; j < b.length + 1; j++) {
        current[j] = j * nw_indel;
    }
    //console.log(current);

    for (var i = 1; i < a.length + 1; i++) {
        for (var j = 0; j < b.length + 1; j++) {
            lookback[j] = current[j];
        }
        current[0] = i * nw_indel;
        //console.log(lookback);
        //console.log(current[0]);
        for (var j = 1; j < b.length + 1; j++) {
            if (a[i-1] === b[j-1]) {
                current[j] = lookback[j-1] + nw_match;
            } else {
                current[j] = Math.max(lookback[j-1] + nw_mismatch,
                                Math.max(lookback[j] + nw_indel,
                                    current[j-1] + nw_indel));
            }
        }
    }

    //console.log("-------------");

    //console.log(lookback);
    //console.log(current);

    return current[b.length];
}


// Tries its best to create all the annotations
// based on the facts it is given
function getClosestMatchElm(sentence) {
    //console.log("getBestSentence called!");
    console.log("OK sentence is " + sentence);
    var potentialElements = $('#viewer').children().children().children().toArray();
    //console.log(potentialElements);
    //facts.forEach ( function(element, index, array) {
        //console.log("Looking for match for sentence: "+ element.sentence);

        var bestSentence = null;
        var bestSentenceScore = 0;

        potentialElements.forEach( function(element2, index2, array2) {
            if ($(element2).text().split(" ").length > 0) {
              var matchScore = lAlign( $(element2).text().split(" "), sentence.split(" ") );
              //console.log("Comparing with " + $(element2).text() + ", got score " + matchScore );
              if (bestSentenceScore == 0 || matchScore > bestSentenceScore) {
                  bestSentenceScore = matchScore;
                  bestSentence = element2;
              }
            }
        });

        //console.log( "The best sentence score " +  bestSentenceScore + " is: " + $(bestSentence).text() );
        
        $(bestSentence).css("background-color", "pink");
        //console.log("About to give you results");
        return bestSentence;

    //} );
};


function javaHashCode(s) {
  var state = 0;
  var c = 0;
  for (var i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    state = (31*state + c) & 0xFFFFFFFF;
  }
  return ((state + 0x80000000) & 0xFFFFFFFF) - 0x80000000;
}

exports.$ = $;
exports.Promise = Promise;
exports.gettext = gettext;
exports.escapeHtml = escapeHtml;
exports.getGlobal = getGlobal;
exports.mousePosition = mousePosition;
exports.getXPath = getXPath;
exports.lAlign = lAlign;
exports.getClosestMatchElm = getClosestMatchElm;
exports.javaHashCode = javaHashCode;
//exports.guid = guid;
