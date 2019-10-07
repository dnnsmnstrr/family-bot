var os = require('os');
var jspath = require('path');
var flat = require('./array').flat

var self = module.exports = {
    fs: require('fs'),
    uc() { 
        return this.toUpperCase(); 
    },
    lc() { 
        return this.toLowerCase(); 
    },
    tc() {
        return this.toLowerCase().split(/\b/)
            .map(s => s.length > 1 ? (s.charAt(0).toUpperCase() + s.substr(1)) : s)
            .join('');
    },
    tr(scs, rcs) {
        var ret = '';
        for (var i = 0; i < this.length; i++) {
            var j = scs.indexOf(this[i]);
            ret +=  j > -1 ? rcs[j] : this[i];
        }
        return ret;
    },
    sprintf(o) {
        var s = this.toString();
        if (typeof o != 'object') return s;
        if (Array.isArray(o)) {
            for (let i = 0; i < o.length; i++) {
                if (typeof o[i] != 'object')
                    s = s.replace('%s', o[i]);
            }
            return s;
        }
        for (var k in o)
            s = s.replace(new RegExp('%{' + k + '}', 'g'), o[k]);
        return s;
    },
    replaceall(sstr, rstr) {
        return this.split(sstr).join(rstr);
    },
    chomp(re = '\n') {
        if (re instanceof RegExp) re = re.toString().replace(/\//g, '');
        else re = re.replaceall('.', '\\.')
        return this.replace(new RegExp(re + '$'), '');
    },
    unindent() {
        var level = this.match(/^\n?([ \t]*)/);
        var re = new RegExp('^' + level[1], 'gm');
        return this.trim().replace(re, '');
    },
    heredoc() {
        return this.unindent()
            .replace(/([^\n])\n/g, '$1 ');
    },
    keyval(ks = "=", rs = "\n", qa = false) {
        var ret = {};
        this.split(rs).forEach(s => {
            if (!s) return;
            var [k, v] = s.split(ks);
            ret[k] = v.match(/^\d+(?:\.\d+)?$/) && !qa ? parseFloat(v) : v;
        });
        return ret;
    },
    q(v = "'") {
        if (!v) v = '"';
        var [qb, qe] = v.split('');
        if (!qe) qe = qb;
        var re = new RegExp("^[X]|[X]$".replace(/X/g, v), "g");
        return qb + this.replace(re, '') + qe;
    },
    arr(dc, cb) {
        if (typeof dc == 'function') { cb = dc; dc = '' }
        var ret = this.split(charSet(dc));
        if (!cb) return ret;
        ret.forEach(v => cb(v));
    },
    splitn(dc, n = 2) {
        if (Number.isInteger(dc)) { n = dc; dc = ''}
        if (n < 2) return [this.toString()];
        if (!dc) dc = '/|,;.\t\n';
        
        var ret = [], s = this.toString();
        for (var i = 0; i < n - 1; i++) {
            let m = s.match(charSet(dc));
            if (!m) break;
            ret[i] = s.substr(0, m.index);
            s = s.substr(m.index + m[0].length);
        }
        ret[i] = s;
        return ret;
    },
    nth(n, dc) {
        var r = this.arr(dc);
        if (n < 0) n = r.length + n;
        return r[n] || '';
    },
    extract(re, empty = false) {
        var m, ret = [];
        if (isRegExpGlobal(re))
            while (m = re.exec(this)) ret = ret.concat(m.slice(1));
        else {
            m = this.match(re);
            if (m) ret = m.slice(1);
        }
        return ret.length == 0
            ? (empty == true 
                ? this.toString() 
                : (empty == false ? ret : empty)
            )
            : ret.length == 1 
            ? ret[0] 
            : ret;
    },
    json() {
        var s = this.trim();
        return s ? JSON.parse(s) : {};
    },
    path(segment = 'filename') {
        if (segment == 'filename')
            return this.replace(/^.*\//, '');
        if (segment == 'basename')
            return this.replace(/^.*\//, '').replace(/\.\w+$/, '');
        if (segment == 'dir')
            return this.replace(/\/[^/]*$/, '');
    },
    resolve() {
        var s = this.toString().replace(/^~/, os.homedir());
        return jspath.resolve(s);
    },
    mkdir(opts) {
        // var path = this.toString();
        // self.fs.mkdirSync(path, Object.assign(opts, {recursive: true}));
        var path = this.toString().resolve().split('/');
        for (var i = 2; i <= path.length; i++) {
            var d = path.slice(0, i).join('/');
            if (!self.fs.existsSync(d))
                self.fs.mkdirSync(d, opts);
        }
    },
    rmdir(opts = {}) {
        var path = this.resolve();
        if (opts.recurse) path.ls({recurse: true, withFileTypes: true})
            .sort((a,b) => a.name.length < b.name.length ? 1 : -1)
            .forEach(o => {
                if (o.isDirectory()) self.fs.rmdirSync(o.name);
                else self.fs.unlinkSync(o.name);
            })
        self.fs.rmdirSync(path);
    },
    ls(filter, opts = {}) {
        var path = this.resolve();
        if (filter) {
            var rex = filter instanceof RegExp;
            if (!rex) { opts = filter; filter = opts.filter; }
        }
        var ret;
        if (!opts.recurse) ret = ls(path, opts);
        else {
            ret = lsr(path, opts);
            if (!opts.withFileTypes) ret = ret.map(o => o.name);
        }
        if (rex) ret = ret.filter(nm => (
            typeof nm == 'object' ? nm.name : nm).match(filter)
        );
        if (opts.fullpath) ret = ret.map(fn => path + '/' + fn);
        return ret;
    },
    cat(opts = 'utf8') {
        return self.fs.readFileSync(this.resolve(), opts);
    },
    tee(s, opts = {}) {
        var argIsPath = 'argIsPath' in opts
            ? opts.argIsPath 
            : s.indexOf('/') > -1
            ;
        var [path, data] = swap(!argIsPath, s, this.resolve());
        self.fs.writeFileSync(path, data, opts);
    },
    cp(dst, flags) {
        self.fs.copyFileSync(this.resolve(), dst, flags);
    },
    mv(dst) {
        self.fs.renameSync(this.resolve(), dst);
    },
    rm() {
        self.fs.unlinkSync(this.resolve());
    },
    chmod(mode) {
        return self.fs.chmodSync(this.resolve(), mode);
    },
    chown(uid, gid) {
        self.fs.chownSync(this.resolve(), uid, gid);
    },
    fex() {
        return self.fs.existsSync(this.resolve());
    },
    fstat(opts = {}) {
        var path = this.resolve()
        var fn = opts.symlinks ? 'lstat' : 'stat'; 
        return self.fs[fn + 'Sync'](path, opts);
    },
    symlink(target, type) {
        var path = this.resolve();
        self.fs.symlinkSync(target, path, type);
    }
}

function isRegExpGlobal(re) {
    var mods = re.toString().split('/')[2];
    return mods.indexOf('g') > -1;
}

function charSet(dc) {
    if (!dc) dc = '/|,;. \t\n';
    return new RegExp('[' + dc + ']+');
}

function swap(cond, a, b) {
    return cond ? [b, a] : [a, b];
}

function ls(path, opts = {}) {
    var ret = self.fs.readdirSync(path, opts);
    if (!opts.withFileTypes) return ret;

    // node v8 does not support withFileTypes so we must emulate it
    if (typeof ret[0] == 'string') {
        ret = ret.map(fn => {
            var ret = self.fs.lstatSync(path + '/' + fn)
            if (!ret.name) ret.name = fn;   // node v8 doesn't return the name
            return ret;
        })
    }
    if (opts.followSymlinks) {
        ret = ret.map(o => {
            var ret = self.fs.statSync(path + '/' + o.name);
            ret.name = o.name;
            return ret;
        })
    }
    return ret;
}

function lsr(path, opts) {
    if (!path.endsWith('/')) path += '/'
    try {
        var ret = ls(path, Object.assign({withFileTypes: true}, opts))
            .map(o => {
                o.name = path + o.name;
                var ret = [o]
                if (o.isDirectory()) 
                    ret = ret.concat(lsr(o.name, opts))
                return ret;
            })
        return Array.prototype.flat ? ret.flat() : flat(ret);
    }
    catch(e) {
        console.error(e);
    }        
}