const pkg = require('./package.json');
const VER = semVerToInt(pkg.version);

var self = module.exports = {
    extensions: {
        string: require('./string'),
        array: require('./array'),
        object: require('./object'),
        error: require('./error')
    },
    force: false,
    groups: ['array', 'string', 'object', 'error'],
    install(...r) {
        const lib = 'js-prototype-lib';
        if (r.length == 0) r = this.groups;
        iterate(this.ls(...r), (o, fn) => {
            if (!o.val.library) o.val.library = lib;
            if (o.val.library != lib || (o.val.ver || 0) > VER) return;
    
            o.val.ver = VER;
            o.val.version = pkg.version;
            this.setIsProperties(o.nm);
            if (!o.val.prototype[fn.nm] || self.force) mkprop(
                o.val.prototype, fn.nm, fn.val
            );
        })
    },
    uninstall(...r) {
        if (r.length == 0) r = this.groups;
        iterate(this.ls(...r), (o, fn) => {
            delete o.val.prototype[fn.nm];
        })
    },
    ls(...ls) {
        return ls.map(
            k => (k in this.extensions)
            ? Object.keys(this.extensions[k]).map(s => k + ':' + s)
            : k
        )
        .reduce((ret, v) => ret.concat(v), []);
    },
    version() {
        return {SemVer: pkg.version, nbr: VER};
    },
    setIsProperties(...ls) {
        if (ls.length == 0) ls = this.groups.concat('number');
        var prop = {
            number: 'isNbr', string: 'isStr', 
            array: 'isArr', object: 'isObj'
        }
        ls.forEach(nm => {
            if (!prop[nm]) return;
            var o = getObjByName(nm);
            if (o.prototype[prop[nm]]) return;
        
            mkprop(o.prototype, 'typeof', nm);
            Object.keys(prop).forEach(k => {
                mkprop(o.prototype, prop[k], k == nm);
            })
        })
    }
}

// support functions

function tc(s) {
    return s[0].toUpperCase() + s.substr(1);
}
function getObjByName(nm) {
    return eval(tc(nm));
}
function iterate(ls, cb) {
    for (var i = 0; i < ls.length; i++) {
        var [prot, fn] = ls[i].split(':');
        cb(
            {nm: prot, val: getObjByName(prot)}, 
            {nm: fn, val: self.extensions[prot][fn]}
        );
    }
}
function mkprop(o, k, val, opts) {
    var def = {configurable: true, enumerable: false, writable: true};
    Object.defineProperty(o, k,
        Object.assign({value: val}, def, opts)
    );
}
// https://gist.github.com/dislick/914e67444f8f71df3900bd77ccec6091
function semVerToInt(version) {
    // Split a given version string into three parts.
    let parts = version.split('.');
    // Check if we got exactly three parts, otherwise throw an error.
    if (parts.length !== 3) {
        throw new Error('Received invalid version string');
    }
    // Make sure that no part is larger than 1023 or else it
    // won't fit into a 32-bit integer.
    parts.forEach((part) => {
        if (part >= 1024) {
           throw new Error(`Version string invalid, ${part} is too large`);
        }
    });
    // Let's create a new number which we will return later on
    let numericVersion = 0;
    // Shift all parts either 0, 10 or 20 bits to the left.
    for (let i = 0; i < 3; i++) {
        numericVersion |= parts[i] << i * 10;
    }
    return numericVersion;
}