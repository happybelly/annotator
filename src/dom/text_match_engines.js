window.DTM_ExactMatcher = (function() {

  function DTM_ExactMatcher() {
    this.distinct = true;
    this.caseSensitive = false;
  }

  DTM_ExactMatcher.prototype.setDistinct = function(value) {
    return this.distinct = value;
  };

  DTM_ExactMatcher.prototype.setCaseSensitive = function(value) {
    return this.caseSensitive = value;
  };

  DTM_ExactMatcher.prototype.search = function(text, pattern) {
    var i, index, pLen, results;
    pLen = pattern.length;
    results = [];
    index = 0;
    if (!this.caseSensitive) {
      text = text.toLowerCase();
      pattern = pattern.toLowerCase();
    }
    while ((i = text.indexOf(pattern)) > -1) {
      (function(_this) {
        return (function() {
          results.push({
            start: index + i,
            end: index + i + pLen
          });
          if (_this.distinct) {
            text = text.substr(i + pLen);
            return index += i + pLen;
          } else {
            text = text.substr(i + 1);
            return index += i + 1;
          }
        });
      })(this)();
    }
    return results;
  };

  return DTM_ExactMatcher;

})();

window.DTM_RegexMatcher = (function() {
  function DTM_RegexMatcher() {
    this.caseSensitive = false;
  }

  DTM_RegexMatcher.prototype.setCaseSensitive = function(value) {
    return this.caseSensitive = value;
  };

  DTM_RegexMatcher.prototype.search = function(text, pattern) {
    var m, re, results1;
    re = new RegExp(pattern, this.caseSensitive ? "g" : "gi");
    results1 = [];
    while (m = re.exec(text)) {
      results1.push({
        start: m.index,
        end: m.index + m[0].length
      });
    }
    return results1;
  };

  return DTM_RegexMatcher;

})();

window.DTM_DMPMatcher = (function() {
  function DTM_DMPMatcher() {
    var diff_match_patch = require('./diff_match_patch').diff_match_patch;
    this.dmp = new diff_match_patch;
    this.dmp.Diff_Timeout = 0;
    this.caseSensitive = false;
  }

  DTM_DMPMatcher.prototype._reverse = function(text) {
    return text.split("").reverse().join("");
  };

  DTM_DMPMatcher.prototype.getMaxPatternLength = function() {
    return this.dmp.Match_MaxBits;
  };

  DTM_DMPMatcher.prototype.setMatchDistance = function(distance) {
    return this.dmp.Match_Distance = distance;
  };

  DTM_DMPMatcher.prototype.getMatchDistance = function() {
    return this.dmp.Match_Distance;
  };

  DTM_DMPMatcher.prototype.setMatchThreshold = function(threshold) {
    return this.dmp.Match_Threshold = threshold;
  };

  DTM_DMPMatcher.prototype.getMatchThreshold = function() {
    return this.dmp.Match_Threshold;
  };

  DTM_DMPMatcher.prototype.getCaseSensitive = function() {
    return caseSensitive;
  };

  DTM_DMPMatcher.prototype.setCaseSensitive = function(value) {
    return this.caseSensitive = value;
  };

  DTM_DMPMatcher.prototype.search = function(text, pattern, expectedStartLoc) {
    var diff, endIndex, endLen, endLoc, endPos, endSlice, found, lev, matchLen, maxLen, pLen, results, startIndex, startLen, startPos, startSlice;
    if (expectedStartLoc == null) {
      expectedStartLoc = 0;
    }
    if (!(expectedStartLoc >= 0)) {
      throw new Error("Can't search at negavive indices!");
    }
    if (!this.caseSensitive) {
      text = text.toLowerCase();
      pattern = pattern.toLowerCase();
    }
    results = [];
    pLen = pattern.length;
    maxLen = this.getMaxPatternLength();
    if (pLen <= maxLen) {
      results = this.searchForSlice(text, pattern, expectedStartLoc);
    } else {
      startSlice = pattern.substr(0, maxLen);
      startPos = this.searchForSlice(text, startSlice, expectedStartLoc);
      if (startPos.length) {
        startLen = startPos[0].end - startPos[0].start;
        endSlice = pattern.substr(pLen - maxLen, maxLen);
        endLoc = startPos[0].start + pLen - maxLen;
        endPos = this.searchForSlice(text, endSlice, endLoc);
        if (endPos.length) {
          endLen = endPos[0].end - endPos[0].start;
          matchLen = endPos[0].end - startPos[0].start;
          startIndex = startPos[0].start;
          endIndex = endPos[0].end;
          found = text.substr(startIndex, endIndex - startIndex);
          diff = this.dmp.diff_main(pattern, found);
          lev = this.dmp.diff_levenshtein(diff);
          this.dmp.diff_cleanupSemantic(diff);
          if ((pLen * 0.5 <= matchLen && matchLen <= pLen * 1.5)) {
            results.push({
              start: startIndex,
              end: endPos[0].end,
              data: {
                levenshtein: lev
              },
              hiddenData: {
                diff: this.dmp.diff_prettyHtml(diff)
              }
            });
          }
        }
      }
    }
    return results;
  };

  DTM_DMPMatcher.prototype.searchForSlice = function(text, slice, expectedStartLoc) {
    var diff, dneIndex, endIndex, expectedDneLoc, expectedEndLoc, found, lev, nrettap, r1, r2, result, startIndex, txet;
    r1 = this.dmp.match_main(text, slice, expectedStartLoc);
    startIndex = r1.index;
    if (startIndex === -1) {
      return [];
    }
    txet = this._reverse(text);
    nrettap = this._reverse(slice);
    expectedEndLoc = startIndex + slice.length;
    expectedDneLoc = text.length - expectedEndLoc;
    r2 = this.dmp.match_main(txet, nrettap, expectedDneLoc);
    dneIndex = r2.index;
    endIndex = text.length - dneIndex;
    found = text.substr(startIndex, endIndex - startIndex);
    diff = this.dmp.diff_main(slice, found);
    lev = this.dmp.diff_levenshtein(diff);
    this.dmp.diff_cleanupSemantic(diff);
    return result = [
      {
        start: startIndex,
        end: endIndex,
        data: {
          levenshtein: lev
        },
        hiddenData: {
          diff: this.dmp.diff_prettyHtml(diff)
        }
      }
    ];
  };

  return DTM_DMPMatcher;

})();

// ---
// generated by coffee-script 1.9.2
