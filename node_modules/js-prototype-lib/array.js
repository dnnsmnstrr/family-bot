module.exports = {
    lc() {
        return this.map(o => o.lc());
    },
    uc() {
        return this.map(o => o.uc());
    },
    unique() { 
        return this.filter((e, pos) => this.indexOf(e) == pos);
    },
    trim(nonempty = false) {
        var ret = this;
        if (nonempty) ret = ret.filter(s => !!s);
        return ret.map(s => typeof s == 'string' ? s.trim() : s);
    },
    flat(depth = 1) {
        var r = (ret, v) => ret.concat(Array.isArray(v) && depth > 0 ? v.flat(depth - 1) : v);
        return this.reduce(r, []);
    },
    last(n = 0) {
        return this[this.length - (n + 1)];
    },
    unpack() {
        var l = this.length;
        return l == 1 ? this[0] 
            : l == 0 && arguments.length > 0
            ? undefined
            : this;
    },
    keyval(key = 'k', val = 'v') {
        var r = (acc, v) => {
            propadd(acc, v[key], v[val]); return acc; 
        };
        return this.reduce(r, {});
    },
    indexOfObj(filter) {
        var ret = -1;
        this.some((o,i) => {
            if (filter(o)) ret = i;
        })
        return ret;
    },
    json() {
        return JSON.stringify(this);
    },
    item(key, val) {
        if ((key || val) == undefined) return;
        var r = this.filter(o => {
            var v = o[key];
            if (val instanceof RegExp) {
                if (typeof v != 'string') v = v.toString();
                return v.match(val);
            }
            else
                return v == val;
        });
        return r[0]; 
    },
    contains(v) {
        return this.indexOf(v) > -1;
    },
    split(n) {
        if (!n) return this;
        var ret = [];
        for (var i = 0; i < this.length; i++) {
            let j = Math.floor(i / n);
            if (!ret[j]) ret[j] = [];
            ret[j].push(this[i]);
        }
        return ret;
    }
}

function propadd(o, k, v) {
    if (k in o) {
        if (Array.isArray(o[k])) o[k].push(v);
        else o[k] = [o[k], v];
    }
    else o[k] = v;
}
