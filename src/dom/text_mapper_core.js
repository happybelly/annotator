// Generated by CoffeeScript 1.7.1
(function() {
  var TextMapperCore,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  TextMapperCore = (function() {
    var CONTEXT_LEN;

    CONTEXT_LEN = 32;

    function TextMapperCore(_id) {
      this._id = _id != null ? _id : "some mapper";
      this._getMappingsForCharRanges = __bind(this._getMappingsForCharRanges, this);
      this._getContextForCharRange = __bind(this._getContextForCharRange, this);
      this._createSyncAPI();
    }

    TextMapperCore.prototype._createSyncAPI = function() {
      return this._syncAPI = {
        getStartInfoForNode: this._getStartInfoForNode,
        getEndInfoForNode: this._getEndInfoForNode,
        getDocLength: (function(_this) {
          return function() {
            return _this._corpus.length;
          };
        })(this),
        getCorpus: (function(_this) {
          return function() {
            return _this._corpus;
          };
        })(this),
        getContextForCharRange: this._getContextForCharRange,
        getMappingsForCharRange: this._getMappingsForCharRange,
        getMappingsForCharRanges: this._getMappingsForCharRanges,
        getPageIndexForPos: this._getPageIndexForPos
      };
    };

    TextMapperCore.prototype._timestamp = function() {
      return new Date().getTime();
    };

    TextMapperCore.prototype.ready = function(reason, callback) {
      if (callback == null) {
        throw new Error("missing callback!");
      }
      if (this._pendingCallbacks == null) {
        this._pendingCallbacks = [];
      }
      this._pendingCallbacks.push(callback);
      this._startScan(reason);
      return null;
    };

    TextMapperCore.prototype._scanFinished = function() {
      var callback, _ref, _results;
      delete this._pendingScan;
      _results = [];
      while ((_ref = this._pendingCallbacks) != null ? _ref.length : void 0) {
        callback = this._pendingCallbacks.shift();
        _results.push(callback(this._syncAPI));
      }
      return _results;
    };

    TextMapperCore.prototype._getContextForCharRange = function(start, end) {
      var prefix, prefixStart, suffix;
      if (start < 0) {
        throw Error("Negative range start (", start, ") is invalid!");
      }
      if (end > this._corpus.length) {
        throw Error("Range end (", end, ") is after the end of corpus (", this._corpus.length, ")!");
      }
      prefixStart = Math.max(0, start - CONTEXT_LEN);
      prefix = this._corpus.slice(prefixStart, start);
      suffix = this._corpus.slice(end, end + CONTEXT_LEN);
      return [prefix.trim(), suffix.trim()];
    };

    TextMapperCore.prototype._getMappingsForCharRanges = function(charRanges) {
      var charRange, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = charRanges.length; _i < _len; _i++) {
        charRange = charRanges[_i];
        _results.push(this._getMappingsForCharRange(charRange.start, charRange.end));
      }
      return _results;
    };

    TextMapperCore.prototype._getStartPosForNode = function() {
      throw new Error("not implemented");
    };

    TextMapperCore.prototype._getEndPosForNode = function() {
      throw new Error("not implemented");
    };

    TextMapperCore.prototype._getMappingsForCharRange = function() {
      throw new Error("not implemented");
    };

    TextMapperCore.prototype._getPageIndexForPos = function() {
      throw new Error("not implemented");
    };

    TextMapperCore.prototype._log = function() {
      var msg;
      msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return console.log.apply(console, [this._id, ":"].concat(__slice.call(msg)));
    };

    return TextMapperCore;

  })();

  module.exports = TextMapperCore;

}).call(this);
