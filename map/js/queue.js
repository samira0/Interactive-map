// https://d3js.org/d3-queue/ Version 3.0.7. Copyright 2017 Mike Bostock.
!function(t, i) {
    "object" == typeof exports && "undefined" != typeof module ? i(exports) : "function" == typeof define && define.amd ? define(["exports"], i) : i(t.d3 = t.d3 || {})
}(this, function(t) {
    "use strict";
    function i(t) {
        this._size = t,
        this._call = this._error = null,
        this._tasks = [],
        this._data = [],
        this._waiting = this._active = this._ended = this._start = 0
    }
    function r(t) {
        if (!t._start)
            try {
                n(t)
            } catch (i) {
                if (t._tasks[t._ended + t._active - 1])
                    e(t, i);
                else if (!t._data)
                    throw i
            }
    }
    function n(t) {
        for (; t._start = t._waiting && t._active < t._size; ) {
            var i = t._ended + t._active
              , r = t._tasks[i]
              , n = r.length - 1
              , e = r[n];
            r[n] = a(t, i),
            --t._waiting,
            ++t._active,
            r = e.apply(null, r),
            t._tasks[i] && (t._tasks[i] = r || c)
        }
    }
    function a(t, i) {
        return function(n, a) {
            t._tasks[i] && (--t._active,
            ++t._ended,
            t._tasks[i] = null,
            null == t._error && (null != n ? e(t, n) : (t._data[i] = a,
            t._waiting ? r(t) : o(t))))
        }
    }
    function e(t, i) {
        var r, n = t._tasks.length;
        for (t._error = i,
        t._data = void 0,
        t._waiting = NaN; --n >= 0; )
            if ((r = t._tasks[n]) && (t._tasks[n] = null,
            r.abort))
                try {
                    r.abort()
                } catch (i) {}
        t._active = NaN,
        o(t)
    }
    function o(t) {
        if (!t._active && t._call) {
            var i = t._data;
            t._data = void 0,
            t._call(t._error, i)
        }
    }
    function s(t) {
        if (null == t)
            t = 1 / 0;
        else if (!((t = +t) >= 1))
            throw new Error("invalid concurrency");
        return new i(t)
    }
    var l = [].slice
      , c = {};
    i.prototype = s.prototype = {
        constructor: i,
        defer: function(t) {
            if ("function" != typeof t)
                throw new Error("invalid callback");
            if (this._call)
                throw new Error("defer after await");
            if (null != this._error)
                return this;
            var i = l.call(arguments, 1);
            return i.push(t),
            ++this._waiting,
            this._tasks.push(i),
            r(this),
            this
        },
        abort: function() {
            return null == this._error && e(this, new Error("abort")),
            this
        },
        await: function(t) {
            if ("function" != typeof t)
                throw new Error("invalid callback");
            if (this._call)
                throw new Error("multiple await");
            return this._call = function(i, r) {
                t.apply(null, [i].concat(r))
            }
            ,
            o(this),
            this
        },
        awaitAll: function(t) {
            if ("function" != typeof t)
                throw new Error("invalid callback");
            if (this._call)
                throw new Error("multiple await");
            return this._call = t,
            o(this),
            this
        }
    },
    t.queue = s,
    Object.defineProperty(t, "__esModule", {
        value: !0
    })
});
