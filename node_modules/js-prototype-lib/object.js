module.exports = {
    isEmpty() {
        return this.keys().length == 0;
    },
    uc(keys = []) {
        if (keys.isStr) keys = keys.arr();
        if (keys.length == 0) keys = this.keys()
        keys.forEach(k => this[k] = this[k].uc());
    },
    lc(keys = []) {
        if (keys.isStr) keys = keys.arr();
        if (keys.length == 0) keys = this.keys()
        keys.forEach(k => this[k] = this[k].lc());
    },
    keys() {
        return Object.keys(this);
    },
    vals(fn) {
        if (!fn) return this.keys().map(k => this[k]);
        this.keys().forEach(k => fn(this[k]));
    },
    slice(keys) {
        if (keys.isStr) keys = keys.arr();
        var r = (acc, k) => {
            if (k in this) acc[k] = this[k];
            return acc;
        }
        return keys.reduce(r, {});
    },
    map(fn, acc = {}) {
        var r = (acc, k) => (fn(this, k, acc), acc);
        return this.keys().reduce(r, acc);
    },
    each(fn) {
        this.keys().forEach(k => fn(k, this))  
    },
    keyval(ks = '=', rs = '\n') {
        if (typeof ks == 'string') {
            var r = (o, k, acc) => {
                acc.push(k + ks + o[k]);
                return acc;
            }
            return this.map(r, []).join(rs);
        }
        else if (Array.isArray(ks)) {
            var [key, val] = ks;
            var r = (o, k, acc) => {
                acc.push({[key || 'k']: k, [val || 'v']: o[k]});
                return acc;
            }
            return this.map(r, []);    
        }
    },
    assign(...ls) {
        return Object.assign(this, ...ls);
    },
    concat(...ls) {
        return Object.assign({}, this, ...ls);
    },
    def(...ls) {
        return Object.assign({}, ...ls, this);
    },
    mv(o) {
        o.map((self, k, acc) => {
            if (o[k]) this[o[k]] = this[k];
            delete this[k];
        })
        return this;
    },
    mvp(o) {
        return this.map((self, k, acc) => {
            if (k in o) {
                if (o[k]) acc[o[k]] = self[k];
            }
            else acc[k] = self[k];
        })
    },
    rm(...ls) {
        if (ls.length == 1) ls = ls[0].arr();
        ls.forEach(k => delete this[k]);
        return this;
    },
    rmp(...ls) {
        var ret = {}.concat(this);
        if (ls.length == 1) ls = ls[0].arr();
        ls.forEach(k => delete ret[k]);
        return ret;
    },
    notIn(o) {
        var ok = o.keys();
        return this.keys().filter(k => ok.indexOf(k) == -1);
    },
    getpath(path) {
        var p = mkpath(this, path);
        return p.o[p.k]; 
    },
    setpath(path, v, init = false) {
        var p = mkpath(this, path);
        if (!init || !(p.k in p.o)) p.o[p.k] = v;
        // p.o[p.k] = v;
        return p.o;
    },
    json(safe = false) {
        if (this instanceof Error) return JSON.stringify(this.obj());
        return safe ? safeJSON(this) : JSON.stringify(this);
    }
}

function mkpath(o, path) {
    path = path.replace(/\./g, '/').split('/');
    var k = path.pop();
    path.forEach(k => { if (!o[k]) o[k] = {}; o = o[k]; })
    return {k, o};
}

// https://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json

function safeJSON(v) {
    const cache = new Set();
    return JSON.stringify(v, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          // Circular reference found
          try {
            // If this value does not reference a parent it can be deduped
           return JSON.parse(JSON.stringify(value));
          }
          catch (err) {
            // discard key if value cannot be deduped
           return;
          }
        }
        // Store value in our set
        cache.add(value);
      }
      return value;
    });
  };
