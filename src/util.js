"use strict";

var $ = require('jquery');
var Promise = require('es6-promise').Promise;

require('./dom/dom_text_mapper')
require('./dom/dom_text_matcher')
require('./dom/text_match_engines')
require('./dom/text_mapper_core')
require('./dom/diff_match_patch')


var matcherSingleton = (function () {
    var instance;
    function createInstance() {
        var _mapper =  new DomTextMapper();
        _mapper.scan()
        var object =  new DomTextMatcher(_mapper);
        return object;
    }
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

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


// I18N
var gettext = (function () {
    if (typeof global.Gettext === 'function') {
        var _gettext = new global.Gettext({domain: "annotator"});
        return function (msgid) { return _gettext.gettext(msgid); };
    }

    return function (msgid) { return msgid; };
}());


// Returns the absolute position of the mouse relative to the top-left rendered
// corner of the page (taking into account padding/margin/border on the body
// element as necessary).
function mousePosition(event) {
    var body = global.document.body;
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


function getClosestMatchElm(sentence, start_position) {
    //console.log("getBestSentence called!");
    sentence = sentence.replace(/ +(?= )/g,'');
    console.log("OK sentence is " + sentence);
    var results =  matcherSingleton.getInstance().searchFuzzy(sentence, start_position, false, null)
    return (results.matches.length == 0)  ? null : results.matches[0]
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
exports.mousePosition = mousePosition;
exports.getXPath = getXPath;
exports.getClosestMatchElm = getClosestMatchElm;
exports.javaHashCode = javaHashCode;
//exports.guid = guid;
