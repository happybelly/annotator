window.DomTextMatcher = (function() {

  var diff_match_patch = require('./diff_match_patch').diff_match_patch;
  var $ = require('jquery');

  DomTextMatcher.prototype.setRootNode = function(rootNode) {
    return this.mapper.setRootNode(rootNode);
  };

  DomTextMatcher.prototype.setRootId = function(rootId) {
    return this.mapper.setRootId(rootId);
  };

  DomTextMatcher.prototype.setRootIframe = function(iframeId) {
    return this.mapper.setRootIframe(iframeId);
  };

  DomTextMatcher.prototype.setRealRoot = function() {
    return this.mapper.setRealRoot();
  };

  DomTextMatcher.prototype.getAllPaths = function() {
    return this.mapper.getAllPaths();
  };

  DomTextMatcher.prototype.prepareSearch = function(path, rescan) {
    var t0, t1;
    if (rescan == null) {
      rescan = false;
    }
    t0 = this.timestamp();
    this.mapper.scan(path, rescan);
    t1 = this.timestamp();
    return t1 - t0;
  };

  DomTextMatcher.prototype.searchExact = function(pattern, distinct, caseSensitive, path, rescan) {
    if (distinct == null) {
      distinct = true;
    }
    if (caseSensitive == null) {
      caseSensitive = false;
    }
    if (path == null) {
      path = null;
    }
    if (rescan == null) {
      rescan = false;
    }
    if (!this.pm) {
      this.pm = new window.DTM_ExactMatcher;
    }
    this.pm.setDistinct(distinct);
    this.pm.setCaseSensitive(caseSensitive);
    return this.search(this.pm, pattern, null, path, rescan);
  };

  DomTextMatcher.prototype.searchRegex = function(pattern, caseSensitive, path, rescan) {
    if (caseSensitive == null) {
      caseSensitive = false;
    }
    if (path == null) {
      path = null;
    }
    if (rescan == null) {
      rescan = false;
    }
    if (!this.rm) {
      this.rm = new window.DTM_RegexMatcher;
    }
    this.rm.setCaseSensitive(caseSensitive);
    return this.search(this.rm, pattern, null, path, rescan);
  };

  DomTextMatcher.prototype.searchFuzzy = function(pattern, pos, caseSensitive, matchDistance, matchThreshold, path, rescan) {
    if (caseSensitive == null) {
      caseSensitive = false;
    }
    if (matchDistance == null) {
      matchDistance = Infinity;
    }
    if (matchThreshold == null) {
      matchThreshold = 0.5;
    }
    if (path == null) {
      path = null;
    }
    if (rescan == null) {
      rescan = false;
    }
    if (this.dmp == null) {
      this.dmp = new window.DTM_DMPMatcher;
    }
    this.dmp.setMatchDistance(matchDistance);
    this.dmp.setMatchThreshold(matchThreshold);
    this.dmp.setCaseSensitive(caseSensitive);
    return this.search(this.dmp, pattern, pos, path, rescan);
  };

  DomTextMatcher.prototype.select = function(results, indices) {
    var i, index, j, len, len1, results1, results2, sel;
    if (indices == null) {
      indices = null;
    }
    if (results == null) {
      return;
    }
    len = results.matches.length;
    if (indices != null) {
      if (typeof indices === 'number') {
        indices = [indices];
      }
    } else {
      indices = (function() {
        results1 = [];
        for (var i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--){ results1.push(i); }
        return results1;
      }).apply(this);
    }
    sel = window.getSelection();
    sel.removeAllRanges();
    results2 = [];
    for (j = 0, len1 = indices.length; j < len1; j++) {
      index = indices[j];
      if ((0 <= index && index < len)) {
        results2.push((function(_this) {
          return function(index) {
            var match;
            match = results.matches[index];
            return sel.addRange(match.range);
          };
        })(this)(index));
      }
    }
    return results2;
  };

  DomTextMatcher.prototype.highlight = function(results, hiliteTemplate, indices) {
    var fn, fn1, hilitePaths, i, index, j, len, len1, matches, path, results1, toInsert, toRemove;
    if (hiliteTemplate == null) {
      hiliteTemplate = null;
    }
    if (indices == null) {
      indices = null;
    }
    if (hiliteTemplate == null) {
      hiliteTemplate = this.standardHilite;
    }
    len = results.matches.length;
    if (indices != null) {
      if (typeof indices === 'number') {
        indices = [indices];
      }
    } else {
      if (len) {
        indices = (function() {
          results1 = [];
          for (var i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--){ results1.push(i); }
          return results1;
        }).apply(this);
      } else {
        return;
      }
    }
    toInsert = [];
    toRemove = [];
    hilitePaths = {};
    fn = (function(_this) {
      return function(index) {
        var k, len2, match, ref, results2;
        if (!((0 <= index && index < len))) {
          return console.log("Warning: match #" + index + " does not exist! (Allowed: [" + index + " - " + (len - 1) + "])");
        } else {
          ref = results.matches[index].nodes;
          results2 = [];
          for (k = 0, len2 = ref.length; k < len2; k++) {
            match = ref[k];
            results2.push((function(match) {
              var path;
              path = match.element.path;
              if (hilitePaths[path] == null) {
                hilitePaths[path] = [];
              }
              return hilitePaths[path].push(match);
            })(match));
          }
          return results2;
        }
      };
    })(this);
    for (j = 0, len1 = indices.length; j < len1; j++) {
      index = indices[j];
      fn(index);
    }
    fn1 = (function(_this) {
      return function(path, matches) {
        var clone, firstRegion, fn2, full, hl, k, l, len2, len3, match, nextPart, node, range, ranges;
        node = matches[0].element.node;
        ranges = _this.uniteRanges((function() {
          var k, len2, results2;
          results2 = [];
          for (k = 0, len2 = matches.length; k < len2; k++) {
            match = matches[k];
            results2.push({
              start: match.startCorrected,
              end: match.endCorrected
            });
          }
          return results2;
        })());
        clone = node.cloneNode();
        for (k = 0, len2 = matches.length; k < len2; k++) {
          match = matches[k];
          match.element.node = clone;
        }
        len = node.data.length;
        full = ranges.length === 1 && ranges[0].start === 0 && ranges[0].end === len;
        if (full) {
          hl = _this.hilite(node, hiliteTemplate);
          toInsert.push({
            node: clone,
            before: hl
          });
          return toRemove.push(hl);
        } else {
          index = 0;
          firstRegion = true;
          nextPart = node;
          fn2 = function(range) {
            var beforePart, firstPart, firstRange, lastPart, middlePart, remainingPart;
            if (range.start === 0) {
              nextPart = nextPart.splitText(range.end);
              firstPart = nextPart.previousSibling;
              hl = _this.hilite(firstPart, hiliteTemplate);
              toInsert.push({
                node: clone,
                before: hl
              });
              toRemove.push(hl);
              index = range.end - 1;
            } else if (range.end === len) {
              lastPart = nextPart.splitText(range.start - index);
              nextPart = null;
              remainingPart = lastPart.previousSibling;
              hl = _this.hilite(lastPart, hiliteTemplate);
              if (firstRegion) {
                toInsert.push({
                  node: clone,
                  before: remainingPart
                });
              }
              toRemove.push(remainingPart);
              toRemove.push(hl);
            } else {
              middlePart = nextPart.splitText(range.start - index);
              beforePart = middlePart.previousSibling;
              nextPart = middlePart.splitText(range.end - range.start);
              hl = _this.hilite(middlePart, hiliteTemplate);
              if (firstRegion) {
                toInsert.push({
                  node: clone,
                  before: beforePart
                });
              }
              toRemove.push(beforePart);
              toRemove.push(hl);
              index = range.end - 1;
            }
            return firstRange = false;
          };
          for (l = 0, len3 = ranges.length; l < len3; l++) {
            range = ranges[l];
            fn2(range);
          }
          if (nextPart != null) {
            return toRemove.push(nextPart);
          }
        }
      };
    })(this);
    for (path in hilitePaths) {
      matches = hilitePaths[path];
      fn1(path, matches);
    }
    return results.undoHilite = {
      insert: toInsert,
      remove: toRemove
    };
  };

  DomTextMatcher.prototype.undoHighlight = function(searchResult) {
    var i, insert, j, len1, len2, ref, ref1, remove;
    if (searchResult.undoHilite == null) {
      return;
    }
    ref = searchResult.undoHilite.insert;
    for (i = 0, len1 = ref.length; i < len1; i++) {
      insert = ref[i];
      insert.before.parentNode.insertBefore(insert.node, insert.before);
    }
    ref1 = searchResult.undoHilite.remove;
    for (j = 0, len2 = ref1.length; j < len2; j++) {
      remove = ref1[j];
      remove.parentNode.removeChild(remove);
    }
    return searchResult.undoHilite = null;
  };

  function DomTextMatcher(domTextMapper) {
    var hl;
    this.mapper = domTextMapper;
    hl = document.createElement("span");
    hl.setAttribute("style", "background-color: red; color: black; border-radius: 3px; box-shadow: 0 0 2px black;");
    this.standardHilite = hl;
  }

  DomTextMatcher.prototype.search = function(matcher, pattern, pos, path, rescan) {
    var fn, i, len1, match, matches, t0, t1, t2, t3, textMatches;
    if (path == null) {
      path = null;
    }
    if (rescan == null) {
      rescan = false;
    }
    if (pattern == null) {
      throw new Error("Can't search for null pattern!");
    }
    pattern = pattern.trim();
    if (pattern == null) {
      throw new Error("Can't search an for empty pattern!");
    }
    t0 = this.timestamp();
    if (path != null) {
      this.prepareSearch(path, rescan);
    }
    t1 = this.timestamp();
    if (this.mapper.corpus == null) {
      throw new Error("Not prepared to search! (call PrepareSearch, or pass me a path)");
    }
    textMatches = matcher.search(this.mapper.corpus, pattern, pos);
    t2 = this.timestamp();
    matches = [];
    fn = (function(_this) {
      return function(match) {
        return matches.push($.extend({}, match, _this.analyzeMatch(pattern, match), _this.mapper.getMappingsFor(match.start, match.end)));
      };
    })(this);
    for (i = 0, len1 = textMatches.length; i < len1; i++) {
      match = textMatches[i];
      fn(match);
    }
    t3 = this.timestamp();
    return {
      matches: matches,
      time: {
        phase0_domMapping: t1 - t0,
        phase1_textMatching: t2 - t1,
        phase2_matchMapping: t3 - t2,
        total: t3 - t0
      }
    };
  };

  DomTextMatcher.prototype.hilite = function(node, template) {
    var hl, parent;
    parent = node.parentNode;
    if (parent == null) {
      console.log("Warning: hilited node has no parent!");
      console.log(node);
      return;
    }
    window.wtft = template;
    hl = template.cloneNode();
    hl.appendChild(node.cloneNode());
    node.parentNode.insertBefore(hl, node);
    node.parentNode.removeChild(node);
    return hl;
  };

  DomTextMatcher.prototype.timestamp = function() {
    return new Date().getTime();
  };

  DomTextMatcher.prototype.analyzeMatch = function(pattern, match) {
    var found;
    found = this.mapper.corpus.substr(match.start, match.end - match.start);
    return {
      found: found,
      exact: found === pattern
    };
  };

  DomTextMatcher.prototype.compareRanges = function(a, b) {
    if (a.start < b.start) {
      return -1;
    } else if (a.start > b.start) {
      return 1;
    } else if (a.end < b.end) {
      return -1;
    } else if (a.end > b.end) {
      return 1;
    } else {
      return 0;
    }
  };

  DomTextMatcher.prototype.uniteRanges = function(ranges) {
    var fn, i, lastRange, len1, range, ref, united;
    united = [];
    lastRange = null;
    ref = ranges.sort(this.compareRanges);
    fn = (function(_this) {
      return function(range) {
        if ((lastRange != null) && lastRange.end >= range.start - 1) {
          if (range.end > lastRange.end) {
            return lastRange.end = range.end;
          }
        } else {
          return united.push(lastRange = {
            start: range.start,
            end: range.end
          });
        }
      };
    })(this);
    for (i = 0, len1 = ref.length; i < len1; i++) {
      range = ref[i];
      fn(range);
    }
    return united;
  };

  return DomTextMatcher;

})();

// ---
// generated by coffee-script 1.9.2
