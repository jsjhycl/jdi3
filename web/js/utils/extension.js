String.prototype.wrap = function (head, tail) {
    head = head || '"';
    tail = tail || head;
    return head + this + tail;
};

String.prototype.toJSON = function () {
    if (!this || this.length <= 0) return null;
    try {
        return JSON.parse(this);
    } catch (e) {
        console.log("String.toJSON e:", e);
        return null;
    }
};

String.prototype.colorHex = function () {
    var that = this,
        result = "#",
        regex = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (/^(rgb|RGB)/.test(that)) {
        that.replace(/(?:\(|\)|rgb|RGB)*/g, "")
            .split(",")
            .forEach(function (item) {
                var hex = Number(item).toString(16);
                if (hex === "0") {
                    hex += hex;
                }
                result += hex;
            });
        if (result.length !== 7) {
            result = that;
        }
    } else if (regex.test(that)) {
        var parts = that.replace(/#/, "").split("");
        if (parts.length === 3) {
            parts.forEach(function (item) {
                result += item + item;
            });
        } else {
            result = that;
        }
    } else {
        result = that;
    }
    return result;
};

String.prototype.colorRgb = function () {
    var that = this,
        result = that.toLowerCase(),
        regex = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (regex.test(result)) {
        if (result.length === 4) {
            result = "#";
            for (var i = 1; i < 4; i++) {
                result += result.slice(i, i + 1).concat(result.slice(i, i + 1));
            }
        }
        var colors = [];
        for (var j = 1; j < 7; j += 2) {
            colors.push(parseInt("0x" + result.slice(j, j + 2)));
        }
        return "RGB(" + colors.join(",") + ")";
    }
    return result;
};

Array.prototype.max = function (type) {
    var max;
    switch (type) {
        case "String":
            max = this[0];
            for (var i = 0; i < this.length; i++) {
                var item = this[i];
                if (item.localeCompare(max) > 0) {
                    max = item;
                }
            }
            break;
        case "Number":
            max = Math.max.apply({}, this);
            break;
        default:
            max = Math.max.apply({}, this);
            break;
    }
    return max;
};

Array.prototype.distinct = function () {
    var result = [],
        temp = {};
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (!temp[item]) {
            result.push(item);
            temp[item] = true;
        }
    }
    return result;
};

Array.prototype.isExist = function (key, value) {
    if (!key) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return true;
            }
        }
        return false;
    } else {
        for (var j = 0; j < this.length; j++) {
            var item = this[j];
            if (item.hasOwnProperty(key) && item[key] === value) {
                return true;
            }
        }
        return false;
    }
};

Array.prototype.isRepeat = function () {
    return this.distinct().length !== this.length;
};

Date.prototype.toFormatString = function (format, zero, noSubstr) {
    format = format || "yyyy-MM-dd hh:mm:ss";
    zero = !!zero,
    noSubstr = !!noSubstr;
    var dy = this.getFullYear(),
        dM = this.getMonth() + 1,
        dd = this.getDate(),
        dh = this.getHours(),
        dm = this.getMinutes(),
        ds = this.getSeconds(),
        dS = this.getMilliseconds(),
        config = {
            "y+": dy.toString(),
            "M+": !zero ? dM.toString() : dM < 10 ? "0" + dM : dM.toString(),
            "d+": !zero ? dd.toString() : dd < 10 ? "0" + dd : dd.toString(),
            "h+": !zero ? dh.toString() : dh < 10 ? "0" + dh : dh.toString(),
            "m+": !zero ? dm.toString() : dm < 10 ? "0" + dm : dm.toString(),
            "s+": !zero ? ds.toString() : ds < 10 ? "0" + ds : ds.toString(),
            "S": dS.toString()
        };
    for (var i in config) {
        var matches = format.match(new RegExp(i, 'img'));
        if (matches) {
            var item = config[i],
                first = matches[0];
            if (i === "S") {
                format = format.replace(first, item);
            } else {
                format = format.replace(first, noSubstr ? item : item.substr(item.length - first.length));
            }
        }
    }
    return format;
};