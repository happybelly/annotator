var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

window.DomTextMapper = (function() {
  function DomTextMapper() {
    this.setRealRoot();
  }

  DomTextMapper.prototype.setRootNode = function(rootNode) {
    this.rootWin = window;
    return this.pathStartNode = this.rootNode = rootNode;
  };

  DomTextMapper.prototype.setRootId = function(rootId) {
    return this.setRootNode(document.getElementById(rootId));
  };

  DomTextMapper.prototype.setRootIframe = function(iframeId) {
    var iframe;
    iframe = document.getElementById(iframeId);
    this.rootWin = iframe.contentWindow;
    this.rootNode = this.rootWin.document;
    return this.pathStartNode = this.getBody();
  };

  DomTextMapper.prototype.setRealRoot = function() {
    this.rootWin = window;
    this.rootNode = document;
    return this.pathStartNode = this.getBody();
  };

  DomTextMapper.prototype.getAllPaths = function() {
    return this.collectPathsForNode(this.pathStartNode);
  };

  DomTextMapper.prototype.scan = function(path, rescan) {
    var node;
    if (path == null) {
      path = null;
    }
    if (rescan == null) {
      rescan = false;
    }
    if (path == null) {
      path = this.getAllPaths()[0];
    }
    if (path === this.scannedPath && !rescan) {
      return;
    }
    node = this.lookUpNode(path);
    this.mappings = [];
    this.collectStrings(node, path.path, null, 0, 0);
    this.scannedPath = path;
    this.corpus = this.mappings[0].content;
    return null;
  };

  DomTextMapper.prototype.getMappingsFor = function(start, end, path, rescan) {
    var endInfo, endMatch, endNode, j, len1, mapping, matches, r, ref, result, startInfo, startMatch, startNode;
    if (path == null) {
      path = null;
    }
    if (rescan == null) {
      rescan = false;
    }
    if (path != null) {
      this.scan(path, rescan);
    } else {
      if (this.scannedPath == null) {
        throw new Error("Can not run getMappingsFor() without existing mappings. Either supply a path to scan, or call scan() beforehand!");
      }
    }
    matches = [];
    ref = this.mappings;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      mapping = ref[j];
      if (mapping.atomic && this.regions_overlap(mapping.start, mapping.end, start, end)) {
        (function(_this) {
          return (function(mapping) {
            var full_match, match;
            match = {
              element: mapping
            };
            full_match = start <= mapping.start && mapping.end <= end;
            if (full_match) {
              match.full = true;
              match.wanted = mapping.content;
            } else {
              if (start <= mapping.start) {
                match.end = end - mapping.start;
                match.wanted = mapping.content.substr(0, match.end);
              } else if (mapping.end <= end) {
                match.start = start - mapping.start;
                match.wanted = mapping.content.substr(match.start);
              } else {
                match.start = start - mapping.start;
                match.end = end - mapping.start;
                match.wanted = mapping.content.substr(match.start, match.end - match.start);
              }
            }
            _this.computeSourcePositions(match);
            match.yields = mapping.node.data.substr(match.startCorrected, match.endCorrected - match.startCorrected);
            return matches.push(match);
          });
        })(this)(mapping);
      }
    }
    r = this.rootWin.document.createRange();
    startMatch = matches[0];
    startNode = startMatch.element.node;
    startInfo = startMatch.element.path;
    if (startMatch.full) {
      r.setStartBefore(startNode);
    } else {
      r.setStart(startNode, startMatch.startCorrected);
      startInfo += ":" + startMatch.startCorrected;
    }
    endMatch = matches[matches.length - 1];
    endNode = endMatch.element.node;
    endInfo = endMatch.element.path;
    if (endMatch.full) {
      r.setEndAfter(endNode);
    } else {
      r.setEnd(endNode, endMatch.endCorrected);
      endInfo += ":" + endMatch.endCorrected;
    }
    result = {
      nodes: matches,
      range: r,
      rangeInfo: {
        start: startInfo,
        end: endInfo
      }
    };
    return result;
  };

  DomTextMapper.prototype.getProperNodeName = function(node) {
    var nodeName;
    nodeName = node.nodeName;
    switch (nodeName) {
      case "#text":
        return "text()";
      case "#comment":
        return "comment()";
      case "#cdata-section":
        return "cdata-section()";
      default:
        return nodeName;
    }
  };

  DomTextMapper.prototype.getPathTo = function(node) {
    var pos, tempitem2, xpath;
    xpath = '';
    while (node !== this.rootNode) {
      pos = 0;
      tempitem2 = node;
      while (tempitem2) {
        if (tempitem2.nodeName === node.nodeName) {
          pos++;
        }
        tempitem2 = tempitem2.previousSibling;
      }
      xpath = (this.getProperNodeName(node)) + (pos > 1 ? "[" + pos + ']' : "") + '/' + xpath;
      node = node.parentNode;
    }
    xpath = (this.rootNode.ownerDocument != null ? './' : '/') + xpath;
    xpath = xpath.replace(/\/$/, '');
    return xpath;
  };

  DomTextMapper.prototype.collectPathsForNode = function(node, results) {
    var children, i, len, ref;
    if (results == null) {
      results = [];
    }
    if (this.careAboutNodeType && (ref = node.nodeType, indexOf.call(this.ignoredNodeTypes, ref) >= 0) && results.length > 0) {
      return;
    }
    len = (this.getNodeContent(node)).length;
    if (len) {
      results.push({
        path: this.getPathTo(node),
        length: len
      });
    }
    if (node.hasChildNodes) {
      children = node.childNodes;
      i = 0;
      while (i < children.length) {
        this.collectPathsForNode(children[i], results);
        i++;
      }
    }
    return results;
  };

  DomTextMapper.prototype.getBody = function() {
    return (this.rootWin.document.getElementsByTagName("body"))[0];
  };

  DomTextMapper.prototype.regions_overlap = function(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
  };

  DomTextMapper.prototype.lookUpNode = function(path) {
    var doc, node, ref, results;
    doc = (ref = this.rootNode.ownerDocument) != null ? ref : this.rootNode;
    results = doc.evaluate(path.path, this.rootNode, null, 0, null);
    return node = results.iterateNext();
  };

  DomTextMapper.prototype.saveSelection = function() {
    var i, j, ref, sel;
    sel = this.rootWin.getSelection();
    for (i = j = 0, ref = sel.rangeCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      this.oldRanges = sel.getRangeAt(i);
    }
    return this.oldRanges != null ? this.oldRanges : this.oldRanges = [];
  };

  DomTextMapper.prototype.restoreSelection = function() {
    var j, len1, range, ref, results1, sel;
    sel = this.rootWin.getSelection();
    sel.removeAllRanges();
    ref = this.oldRanges;
    results1 = [];
    for (j = 0, len1 = ref.length; j < len1; j++) {
      range = ref[j];
      results1.push(sel.addRange(range));
    }
    return results1;
  };

  DomTextMapper.prototype.getNodeSelectionText = function(node, shouldRestoreSelection) {
    var range, sel, text;
    if (shouldRestoreSelection == null) {
      shouldRestoreSelection = true;
    }
    sel = this.rootWin.getSelection();
    if (shouldRestoreSelection) {
      this.saveSelection();
    }
    sel.removeAllRanges();
    range = this.rootWin.document.createRange();
    range.setStartBefore(node);
    range.setEndAfter(node);
    sel.addRange(range);
    text = sel.toString().trim().replace(/\n/g, " ").replace(/[ ][ ]+/g, " ");
    if (shouldRestoreSelection) {
      this.restoreSelection();
    }
    return text;
  };

  DomTextMapper.prototype.computeSourcePositions = function(match) {
    var dc, displayEnd, displayIndex, displayStart, displayText, sc, sourceEnd, sourceIndex, sourceStart, sourceText;
    sourceText = match.element.node.data.replace(/\n/g, " ");
    displayText = match.element.content;
    displayStart = match.start != null ? match.start : 0;
    displayEnd = match.end != null ? match.end : displayText.length;
    sourceIndex = 0;
    displayIndex = 0;
    while (!((sourceStart != null) && (sourceEnd != null))) {
      sc = sourceText[sourceIndex];
      dc = displayText[displayIndex];
      if (sc === dc) {
        if (displayIndex === displayStart) {
          sourceStart = sourceIndex;
        }
        displayIndex++;
        if (displayIndex === displayEnd) {
          sourceEnd = sourceIndex + 1;
        }
      }
      sourceIndex++;
    }
    match.startCorrected = sourceStart;
    match.endCorrected = sourceEnd;
    return null;
  };

  DomTextMapper.prototype.getNodeContent = function(node) {
    return this.getNodeSelectionText(node);
  };

  DomTextMapper.prototype.collectStrings = function(node, parentPath, parentContent, parentIndex, index) {
    var atomic, child, childPath, children, content, endIndex, i, newCount, nodeName, oldCount, pos, startIndex, typeCount;
    if (parentContent == null) {
      parentContent = null;
    }
    if (parentIndex == null) {
      parentIndex = 0;
    }
    if (index == null) {
      index = 0;
    }
    content = this.getNodeContent(node);
    if ((content == null) || content === "") {
      return index;
    }
    startIndex = parentContent != null ? parentContent.indexOf(content, index) : index;
    if (startIndex === -1) {
      return index;
    }
    endIndex = startIndex + content.length;
    atomic = !node.hasChildNodes();
    this.mappings.push({
      "path": parentPath,
      "node": node,
      "content": content,
      "start": parentIndex + startIndex,
      "end": parentIndex + endIndex,
      "atomic": atomic
    });
    if (!atomic) {
      children = node.childNodes;
      i = 0;
      pos = 0;
      typeCount = Object();
      while (i < children.length) {
        child = children[i];
        nodeName = this.getProperNodeName(child);
        oldCount = typeCount[nodeName];
        newCount = oldCount != null ? oldCount + 1 : 1;
        typeCount[nodeName] = newCount;
        childPath = parentPath + "/" + nodeName + (newCount > 1 ? "[" + newCount + "]" : "");
        pos = this.collectStrings(child, childPath, content, parentIndex + startIndex, pos);
        i++;
      }
    }
    return endIndex;
  };

  return DomTextMapper;

})();

// ---
// generated by coffee-script 1.9.2
