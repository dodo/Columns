$(function () {

// vectors

Vector = function Vector(keys, i) {
    if(!keys || !keys.length) throw "Vector no keys given";
    var self = this;
    i = i || {};
    self.keys = keys;
    keys.forEach(function (key) {
        self[key] = i[key] || 0;
    });
};

Vector.prototype.tolist = function () {
    var self = this;
    var result = [];
    self.keys.forEach(function (key) {
        result.push(self[key]);
    });
    return result;
};

Vector.prototype.norm = function () {
    var self = this;
    var mag = self.mag();
    if(mag)
        self.keys.forEach(function (key) {
            self[key] /= mag;
        });
    return this;
};

Vector.prototype.mag = function () {
    var self = this;
    var a = 0;
    self.keys.forEach(function (key) {
        a += self[key]*self[key];
    });
    return Math.sqrt(a);
};

Vector.prototype.add = function (v) {
    var self = this;
    self.keys.forEach(function (key) {
        self[key] += v[key];
    });
    return self;
};

Vector.prototype.sub = function (v) {
    var self = this;
    self.keys.forEach(function (key) {
        self[key] -= v[key];
    });
    return self;
};

Vector.prototype.mul = function (a) {
    var self = this;
    self.keys.forEach(function (key) {
        self[key] *= a;
    });
    return self;
};


// (pseudo) constructors

Vector2D = function (i) {
    return new Vector(['x', 'y'], i);
};


});