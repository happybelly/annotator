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



/*
getEditDistance - Copyright (c) 2011 Andrei Mackenzie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
 
// Compute the edit distance between the two given strings
function getEditDistance(afull, bfull){
  var a = afull.split(" ");
  var b = bfull.split(" ");

  if(a.length == 0) return b.length; 
  if(b.length == 0) return a.length; 
 
  var matrix = [];
 
  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }
 
  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }
 
  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b[i-1] == a[j-1]){
        matrix[i][j] = matrix[i-1][j-1] + 2;
      } else {
        matrix[i][j] = Math.max(matrix[i-1][j-1] - 1, // substitution
                                Math.max(matrix[i][j-1], // insertion
                                         matrix[i-1][j])); // deletion
      }
    }
  }
 
  return matrix[b.length][a.length];
};


// Tries its best to create all the annotations
// based on the facts it is given
function getClosestMatchElm(sentence) {
    //console.log("getBestSentence called!");
    var potentialElements = $('#viewer').children().children().children().toArray();
    //console.log(potentialElements);
    //facts.forEach ( function(element, index, array) {
        //console.log("Looking for match for sentence: "+ element.sentence);

        var bestSentence = null;
        var bestSentenceScore = 0;

        potentialElements.forEach( function(element2, index2, array2) {
            var matchScore = getEditDistance( $(element2).text(), sentence );
            if (bestSentenceScore == 0 || matchScore > bestSentenceScore) {
                bestSentenceScore = matchScore;
                bestSentence = element2;
            }
        });

        //console.log( "The best sentence is -- " + $(bestSentence).text() );
        
        $(bestSentence).css("background-color", "pink");
        return bestSentence;

    //} );
};

// Generate a GUID
// https://stackoverflow.com/questions/105034/
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}




exports.$ = $;
exports.Promise = Promise;
exports.gettext = gettext;
exports.escapeHtml = escapeHtml;
exports.getGlobal = getGlobal;
exports.mousePosition = mousePosition;
exports.getXPath = getXPath;
exports.getEditDistance = getEditDistance;
exports.getClosestMatchElm = getClosestMatchElm;
exports.guid = guid;
